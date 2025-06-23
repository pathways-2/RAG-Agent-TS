import { ToolInvocation, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { RetrievalService } from "@/lib/retrieval";
import { getCountryWeatherData, getTopCities } from "@/lib/weather";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

// Note: Weather functions moved to lib/weather.ts for real-time weather data

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    console.log(`Processing request for ${messages.length} messages`);

    // Keep last 2 messages for some context but not too much
    const limitedMessages = messages.slice(-2);
    console.log(`Limited to ${limitedMessages.length} messages for processing`);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      temperature: 0.1,
      maxTokens: 8000,
      system: `You are GoAware, a travel advisory assistant. When a user asks about a country:

1. Use searchTravelAdvisories to get comprehensive travel advisory information
2. Use getCountryWeather to get current weather data  
3. Present information clearly and comprehensively

IMPORTANT: Always start your response with the official travel advisory level (e.g., "Level 1: Exercise Normal Precautions", "Level 2: Exercise Increased Caution", "Level 3: Reconsider Travel", or "Level 4: Do Not Travel") if this information is available in the travel advisory data.

Format your response as follows:
- Start with the Travel Advisory Level as a clear header
- Follow with comprehensive travel advisory information including all important details about safety, security, entry requirements, health information, and regional warnings
- Do NOT truncate or summarize content - provide all available information
- Organize information in clear, well-structured paragraphs

Do NOT use any markdown formatting (no **, *, #, etc.). Present information in clear, well-organized paragraphs with proper section headings.`,
      messages: limitedMessages,
      onStepFinish(result) {
        console.log(`Step finished: ${result.stepType}`);
      },
      maxSteps: 5, // Allow sufficient steps for complete responses
    tools: {
      searchTravelAdvisories: {
        description: "Search for travel advisories and information for a specific country or destination. Use this tool whenever a user mentions a country or asks about travel to a specific destination.",
        parameters: z.object({
          country: z
            .string()
            .describe("The country or destination to search travel advisories for"),
          query: z
            .string()
            .describe("The specific travel query or information needed (e.g., 'travel advisory', 'safety information', 'entry requirements')"),
        }),
        execute: async ({ country, query }) => {
          try {
            const retrievalService = new RetrievalService();
            const searchQuery = `${country} travel advisory ${query} safety crime terrorism health requirements entry restrictions regional warnings`;
            
            // Get comprehensive results
            const result = await retrievalService.retrieveContext(searchQuery);
            const documents = result.contextDocuments;
            
            if (!documents || documents.trim() === "No relevant documents found.") {
              return `No specific travel advisory information found for ${country} in the database. Please check official government travel advisory websites for the most current information.`;
            }
            
            // Minimal cleaning to preserve content quality
            const cleanedDocuments = documents
              .replace(/\s+/g, ' ')
              .trim();
            
            const response = `Travel Advisory Information for ${country}:

${cleanedDocuments}`;
            
            // Log the response length to help debug
            console.log(`Travel advisory response length for ${country}: ${response.length}`);
            
            return response;
          } catch (error) {
            console.error(`Error in searchTravelAdvisories for ${country}:`, error);
            return `Error retrieving travel advisory information for ${country}. Please try again.`;
          }
        },
      },
      getCountryWeather: {
        description: "Get current weather information for the top cities in a specific country. Use this tool after providing travel advisory information to give users complete travel planning information.",
        parameters: z.object({
          country: z
            .string()
            .describe("The country to get weather information for"),
        }),
        execute: async ({ country }) => {
          try {
            const topCities = getTopCities(country);
            
            // Use the real weather service
            const weatherData = await getCountryWeatherData(country, topCities);
            
            const weatherReport = `Current Weather Conditions in ${country}:

${weatherData.map(data => 
  `${data.city}: ${data.temperature}°C, ${data.condition}, Humidity: ${data.humidity}%, Wind: ${data.windSpeed} km/h`
).join('\n')}

This weather information can help you plan what to pack and the best times to visit outdoor attractions.`;
            
            console.log(`Real weather data retrieved for ${country}: ${topCities.join(', ')}`);
            console.log(`Weather report length: ${weatherReport.length}`);
            
            return weatherReport;
          } catch (error) {
            console.error(`Error in getCountryWeather for ${country}:`, error);
            return `Error retrieving weather information for ${country}. Please try again.`;
          }
        },
      },
    },
  });

  return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in agent API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
