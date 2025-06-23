import { ToolInvocation, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { RetrievalService } from "@/lib/retrieval";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

// Mock function to get location coordinates for cities
function getCityCoordinates(city: string, country: string): { lat: number; lon: number } {
  // This is a simplified mapping - in a real app, you'd use a geocoding API
  const cityCoords: Record<string, { lat: number; lon: number }> = {
    // Japan
    "tokyo,japan": { lat: 35.6762, lon: 139.6503 },
    "osaka,japan": { lat: 34.6937, lon: 135.5023 },
    "kyoto,japan": { lat: 35.0116, lon: 135.7681 },
    
    // India
    "mumbai,india": { lat: 19.0760, lon: 72.8777 },
    "delhi,india": { lat: 28.7041, lon: 77.1025 },
    "bangalore,india": { lat: 12.9716, lon: 77.5946 },
    
    // Pakistan
    "karachi,pakistan": { lat: 24.8607, lon: 67.0011 },
    "lahore,pakistan": { lat: 31.5204, lon: 74.3587 },
    "islamabad,pakistan": { lat: 33.6844, lon: 73.0479 },
    
    // Switzerland
    "zurich,switzerland": { lat: 47.3769, lon: 8.5417 },
    "geneva,switzerland": { lat: 46.2044, lon: 6.1432 },
    "basel,switzerland": { lat: 47.5596, lon: 7.5886 },
    
    // Germany
    "berlin,germany": { lat: 52.5200, lon: 13.4050 },
    "munich,germany": { lat: 48.1351, lon: 11.5820 },
    "hamburg,germany": { lat: 53.5511, lon: 9.9937 },
    
    // France
    "paris,france": { lat: 48.8566, lon: 2.3522 },
    "lyon,france": { lat: 45.7640, lon: 4.8357 },
    "marseille,france": { lat: 43.2965, lon: 5.3698 },
    
    // UK
    "london,uk": { lat: 51.5074, lon: -0.1278 },
    "manchester,uk": { lat: 53.4808, lon: -2.2426 },
    "birmingham,uk": { lat: 52.4862, lon: -1.8904 },
    
    // Greece
    "athens,greece": { lat: 37.9838, lon: 23.7275 },
    "thessaloniki,greece": { lat: 40.6401, lon: 22.9444 },
    "patras,greece": { lat: 38.2466, lon: 21.7346 },
    
    // Turkey
    "istanbul,turkey": { lat: 41.0082, lon: 28.9784 },
    "ankara,turkey": { lat: 39.9334, lon: 32.8597 },
    "izmir,turkey": { lat: 38.4192, lon: 27.1287 },
    
    // Egypt
    "cairo,egypt": { lat: 30.0444, lon: 31.2357 },
    "alexandria,egypt": { lat: 31.2001, lon: 29.9187 },
    "giza,egypt": { lat: 30.0131, lon: 31.2089 },
    
    // Thailand
    "bangkok,thailand": { lat: 13.7563, lon: 100.5018 },
    "chiang mai,thailand": { lat: 18.7061, lon: 98.9817 },
    "phuket,thailand": { lat: 7.8804, lon: 98.3923 },
    
    // Cuba
    "havana,cuba": { lat: 23.1136, lon: -82.3666 },
    "santiago de cuba,cuba": { lat: 20.0247, lon: -75.8219 },
    "camagüey,cuba": { lat: 21.3794, lon: -77.9169 },
    
    // Seychelles
    "victoria,seychelles": { lat: -4.6191, lon: 55.4513 },
    "anse boileau,seychelles": { lat: -4.7189, lon: 55.4794 },
    "beau vallon,seychelles": { lat: -4.6167, lon: 55.4297 },
    
    // Netherlands
    "amsterdam,netherlands": { lat: 52.3676, lon: 4.9041 },
    "rotterdam,netherlands": { lat: 51.9244, lon: 4.4777 },
    "the hague,netherlands": { lat: 52.0705, lon: 4.3007 },
    
    // Italy
    "rome,italy": { lat: 41.9028, lon: 12.4964 },
    "milan,italy": { lat: 45.4642, lon: 9.1900 },
    "naples,italy": { lat: 40.8518, lon: 14.2681 },
    
    // Spain
    "madrid,spain": { lat: 40.4168, lon: -3.7038 },
    "barcelona,spain": { lat: 41.3851, lon: 2.1734 },
    "valencia,spain": { lat: 39.4699, lon: -0.3763 },
    
    // Portugal
    "lisbon,portugal": { lat: 38.7223, lon: -9.1393 },
    "porto,portugal": { lat: 41.1579, lon: -8.6291 },
    "braga,portugal": { lat: 41.5518, lon: -8.4229 },
    
    // Austria
    "vienna,austria": { lat: 48.2082, lon: 16.3738 },
    "salzburg,austria": { lat: 47.8095, lon: 13.0550 },
    "innsbruck,austria": { lat: 47.2692, lon: 11.4041 },
    
    // Bermuda
    "hamilton,bermuda": { lat: 32.2949, lon: -64.7820 },
    "st. george's,bermuda": { lat: 32.3783, lon: -64.6722 },
    "somerset,bermuda": { lat: 32.2942, lon: -64.8538 },
    
    // Caribbean Islands
    "nassau,bahamas": { lat: 25.0443, lon: -77.3504 },
    "freeport,bahamas": { lat: 26.5466, lon: -78.6953 },
    "west end,bahamas": { lat: 26.6866, lon: -78.9761 },
    
    "bridgetown,barbados": { lat: 13.1139, lon: -59.5985 },
    "speightstown,barbados": { lat: 13.2500, lon: -59.6333 },
    "oistins,barbados": { lat: 13.0667, lon: -59.5333 },
    
    "oranjestad,aruba": { lat: 12.5186, lon: -70.0358 },
    "san nicolas,aruba": { lat: 12.4364, lon: -69.9058 },
    "noord,aruba": { lat: 12.5669, lon: -70.0428 },
    
    "san juan,puerto rico": { lat: 18.4655, lon: -66.1057 },
    "bayamón,puerto rico": { lat: 18.3958, lon: -66.1553 },
    "carolina,puerto rico": { lat: 18.3811, lon: -65.9648 },
    
    // Haiti
    "port-au-prince,haiti": { lat: 18.5944, lon: -72.3074 },
    "cap-haïtien,haiti": { lat: 19.7579, lon: -72.2017 },
    "gonaïves,haiti": { lat: 19.4515, lon: -72.6890 },
    
    // Dominican Republic
    "santo domingo,dominican republic": { lat: 18.4861, lon: -69.9312 },
    "santiago,dominican republic": { lat: 19.4517, lon: -70.6970 },
    "puerto plata,dominican republic": { lat: 19.7930, lon: -70.6861 },
    
    // Trinidad and Tobago
    "port of spain,trinidad and tobago": { lat: 10.6596, lon: -61.5089 },
    "san fernando,trinidad and tobago": { lat: 10.2799, lon: -61.4684 },
    "chaguanas,trinidad and tobago": { lat: 10.5155, lon: -61.4097 },
    
    // Yemen
    "sana'a,yemen": { lat: 15.3694, lon: 44.1910 },
    "aden,yemen": { lat: 12.7794, lon: 45.0367 },
    "taiz,yemen": { lat: 13.5795, lon: 44.0209 },
    
    // Malta & Cyprus
    "valletta,malta": { lat: 35.8989, lon: 14.5146 },
    "birkirkara,malta": { lat: 35.8972, lon: 14.4611 },
    "mosta,malta": { lat: 35.9092, lon: 14.4256 },
    
    "nicosia,cyprus": { lat: 35.1856, lon: 33.3823 },
    "limassol,cyprus": { lat: 34.6851, lon: 33.0299 },
    "larnaca,cyprus": { lat: 34.9208, lon: 33.6249 },
    
    // Pacific Islands
    "suva,fiji": { lat: -18.1416, lon: 178.4419 },
    "nadi,fiji": { lat: -17.7765, lon: 177.4162 },
    "lautoka,fiji": { lat: -17.6161, lon: 177.4500 },
    
    // Fallback for unmapped cities - use a more realistic default
    "default": { lat: 25.0, lon: 0.0 }
  };
  
  const key = `${city.toLowerCase()},${country.toLowerCase()}`;
  return cityCoords[key] || cityCoords["default"];
}

// Mock function to get weather data
function getWeather({ lat, lon, unit = "C" }: { lat: number; lon: number; unit?: "C" | "F" }) {
  // This is mock data - in a real app, you'd call a weather API
  const temp = unit === "C" ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 54) + 41;
  const conditions = ["sunny", "cloudy", "partly cloudy", "rainy", "clear"];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    value: temp,
    description: condition,
    humidity: Math.floor(Math.random() * 40) + 30,
    windSpeed: Math.floor(Math.random() * 20) + 5
  };
}

// Function to get top cities for a country
function getTopCities(country: string): string[] {
  const topCities: Record<string, string[]> = {
    "japan": ["Tokyo", "Osaka", "Kyoto"],
    "india": ["Mumbai", "Delhi", "Bangalore"],
    "pakistan": ["Karachi", "Lahore", "Islamabad"],
    "switzerland": ["Zurich", "Geneva", "Basel"],
    "germany": ["Berlin", "Munich", "Hamburg"],
    "france": ["Paris", "Lyon", "Marseille"],
    "uk": ["London", "Manchester", "Birmingham"],
    "united kingdom": ["London", "Manchester", "Birmingham"],
    "china": ["Beijing", "Shanghai", "Guangzhou"],
    "usa": ["New York", "Los Angeles", "Chicago"],
    "united states": ["New York", "Los Angeles", "Chicago"],
    "canada": ["Toronto", "Vancouver", "Montreal"],
    "australia": ["Sydney", "Melbourne", "Brisbane"],
    "italy": ["Rome", "Milan", "Naples"],
    "spain": ["Madrid", "Barcelona", "Valencia"],
    "brazil": ["São Paulo", "Rio de Janeiro", "Brasília"],
    "russia": ["Moscow", "Saint Petersburg", "Novosibirsk"],
    "greece": ["Athens", "Thessaloniki", "Patras"],
    "turkey": ["Istanbul", "Ankara", "Izmir"],
    "egypt": ["Cairo", "Alexandria", "Giza"],
    "thailand": ["Bangkok", "Chiang Mai", "Phuket"],
    "vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang"],
    "south korea": ["Seoul", "Busan", "Incheon"],
    "mexico": ["Mexico City", "Guadalajara", "Monterrey"],
    "argentina": ["Buenos Aires", "Córdoba", "Rosario"],
    "south africa": ["Johannesburg", "Cape Town", "Durban"],
    "netherlands": ["Amsterdam", "Rotterdam", "The Hague"],
    "belgium": ["Brussels", "Antwerp", "Ghent"],
    "portugal": ["Lisbon", "Porto", "Braga"],
    "poland": ["Warsaw", "Krakow", "Gdansk"],
    "czech republic": ["Prague", "Brno", "Ostrava"],
    "austria": ["Vienna", "Salzburg", "Innsbruck"],
    "sweden": ["Stockholm", "Gothenburg", "Malmö"],
    "norway": ["Oslo", "Bergen", "Trondheim"],
    "denmark": ["Copenhagen", "Aarhus", "Odense"],
    "finland": ["Helsinki", "Tampere", "Turku"],
    "ireland": ["Dublin", "Cork", "Galway"],
    "new zealand": ["Auckland", "Wellington", "Christchurch"],
    "singapore": ["Singapore", "Jurong", "Tampines"],
    "malaysia": ["Kuala Lumpur", "George Town", "Johor Bahru"],
    "indonesia": ["Jakarta", "Surabaya", "Bandung"],
    "philippines": ["Manila", "Cebu", "Davao"],
    "cuba": ["Havana", "Santiago de Cuba", "Camagüey"],
    "jamaica": ["Kingston", "Spanish Town", "Portmore"],
    "haiti": ["Port-au-Prince", "Cap-Haïtien", "Gonaïves"],
    "dominican republic": ["Santo Domingo", "Santiago", "Puerto Plata"],
    "trinidad and tobago": ["Port of Spain", "San Fernando", "Chaguanas"],
    "yemen": ["Sana'a", "Aden", "Taiz"],
    "seychelles": ["Victoria", "Anse Boileau", "Beau Vallon"],
    "maldives": ["Malé", "Addu City", "Fuvahmulah"],
    "iceland": ["Reykjavik", "Akureyri", "Reykjanesbær"],
    "croatia": ["Zagreb", "Split", "Rijeka"],
    "slovenia": ["Ljubljana", "Maribor", "Celje"],
    "slovakia": ["Bratislava", "Košice", "Prešov"],
    "hungary": ["Budapest", "Debrecen", "Szeged"],
    "romania": ["Bucharest", "Cluj-Napoca", "Timișoara"],
    "bulgaria": ["Sofia", "Plovdiv", "Varna"],
    "serbia": ["Belgrade", "Novi Sad", "Niš"],
    "bosnia and herzegovina": ["Sarajevo", "Banja Luka", "Tuzla"],
    "montenegro": ["Podgorica", "Nikšić", "Pljevlja"],
    "albania": ["Tirana", "Durrës", "Vlorë"],
    "north macedonia": ["Skopje", "Bitola", "Kumanovo"],
    "moldova": ["Chișinău", "Tiraspol", "Bălți"],
    "estonia": ["Tallinn", "Tartu", "Narva"],
    "latvia": ["Riga", "Daugavpils", "Liepāja"],
    "lithuania": ["Vilnius", "Kaunas", "Klaipėda"],
    "bermuda": ["Hamilton", "St. George's", "Somerset"],
    "bahamas": ["Nassau", "Freeport", "West End"],
    "barbados": ["Bridgetown", "Speightstown", "Oistins"],
    "aruba": ["Oranjestad", "San Nicolas", "Noord"],
    "puerto rico": ["San Juan", "Bayamón", "Carolina"],
    "virgin islands": ["Charlotte Amalie", "Christiansted", "Cruz Bay"],
    "cayman islands": ["George Town", "West Bay", "Bodden Town"],
    "malta": ["Valletta", "Birkirkara", "Mosta"],
    "cyprus": ["Nicosia", "Limassol", "Larnaca"],
    "luxembourg": ["Luxembourg City", "Esch-sur-Alzette", "Differdange"],
    "monaco": ["Monaco-Ville", "Monte Carlo", "La Condamine"],
    "liechtenstein": ["Vaduz", "Schaan", "Balzers"],
    "andorra": ["Andorra la Vella", "Escaldes-Engordany", "Encamp"],
    "san marino": ["San Marino", "Serravalle", "Borgo Maggiore"],
    "vatican city": ["Vatican City"],
    "fiji": ["Suva", "Nadi", "Lautoka"],
    "tonga": ["Nuku'alofa", "Neiafu", "Pangai"],
    "samoa": ["Apia", "Salelologa", "Asau"],
    "vanuatu": ["Port Vila", "Luganville", "Isangel"],
    "solomon islands": ["Honiara", "Auki", "Gizo"],
    "palau": ["Ngerulmud", "Koror", "Airai"],
    "micronesia": ["Palikir", "Weno", "Tofol"],
    "marshall islands": ["Majuro", "Ebeye", "Arno"],
    "kiribati": ["Tarawa", "Betio", "Bikenibeu"],
    "tuvalu": ["Funafuti", "Savave", "Tanrake"],
    "nauru": ["Yaren", "Baiti", "Anabar"],
    "cook islands": ["Avarua", "Amuri", "Matavera"],
    "niue": ["Alofi", "Hakupu", "Vaiea"],
    "tokelau": ["Atafu", "Nukunonu", "Fakaofo"]
  };
  
  return topCities[country.toLowerCase()] || [country]; // Fallback to country name if not found
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    console.log(`Processing request for ${messages.length} messages`);

    // Limit conversation history to prevent memory issues and timeouts
    // Keep only the last 4 messages (2 user + 2 assistant pairs) to maintain context
    const limitedMessages = messages.slice(-4);
    console.log(`Limited to ${limitedMessages.length} messages for processing`);

    const result = streamText({
      model: openai("gpt-4o"),
      temperature: 0.1,
      maxTokens: 4000,
      system: `You are GoAware, a travel advisory assistant. When a user asks about a country:

1. FIRST: Use searchTravelAdvisories to get comprehensive travel advisory information
2. Present the travel advisory information in a clear, organized manner
3. THEN: Use getCountryWeather to get weather information for major cities
4. Present weather information as a completely separate section

CRITICAL RULES:
- NEVER mix weather data into travel advisory content
- Keep travel advisory and weather information completely separate
- Present complete, untruncated travel advisory information first
- Only add weather as a separate, additional service
- Do not include weather data in any travel advisory sections`,
      messages: limitedMessages,
      onStepFinish(result) {
        console.log(`Step finished: ${result.stepType}`);
      },
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
          const retrievalService = new RetrievalService();
          const searchQuery = `${country} travel advisory ${query} safety crime terrorism health requirements entry restrictions regional warnings`;
          
          // Get comprehensive results
          const result = await retrievalService.retrieveContext(searchQuery);
          const documents = result.contextDocuments;
          
          if (!documents || documents.trim() === "No relevant documents found.") {
            return `No specific travel advisory information found for ${country} in the database. Please check official government travel advisory websites for the most current information.`;
          }
          
          // Return the documents with minimal processing to preserve accuracy
          // But remove any weather data that might have been included
          const cleanedDocuments = documents
            .replace(/Current Weather Conditions[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '')
            .replace(/Weather data retrieved[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '')
            .replace(/This weather information[\s\S]*?attractions\./gi, '')
            .replace(/Temperature:|Condition:|Humidity:|Wind Speed:/gi, '')
            .replace(/\d+°C|partly cloudy|sunny|cloudy|rainy/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          const response = `Travel Advisory Information for ${country}:

${cleanedDocuments}

Please present the above travel advisory information accurately, organizing it into clear sections while preserving all important details about safety, security, health, entry requirements, and regional warnings. Do not include any weather information in this response.`;
          
          // Log the response length to help debug
          console.log(`Full response length for ${country}: ${response.length}`);
          
          return response;
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
          const topCities = getTopCities(country);
          const weatherData = [];
          
          for (const city of topCities) {
            const coords = getCityCoordinates(city, country);
            const weather = getWeather({ lat: coords.lat, lon: coords.lon, unit: "C" });
            
            weatherData.push({
              city,
              temperature: weather.value,
              condition: weather.description,
              humidity: weather.humidity,
              windSpeed: weather.windSpeed
            });
          }
          
          const weatherReport = `Current Weather Conditions in ${country}:

${weatherData.map(data => 
  `${data.city}: ${data.temperature}°C, ${data.condition}, Humidity: ${data.humidity}%, Wind: ${data.windSpeed} km/h`
).join('\n')}

This weather information can help you plan what to pack and the best times to visit outdoor attractions.`;
          
          console.log(`Weather data retrieved for ${country}: ${topCities.join(', ')}`);
          console.log(`Weather report length: ${weatherReport.length}`);
          
          return weatherReport;
        },
      },
    },
  });

  return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in agent API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
