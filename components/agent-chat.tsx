"use client";

import { useChat } from "@ai-sdk/react";

// Function to format travel advisory text for better readability
function formatTravelAdvisoryText(text: string) {
  // Minimal cleaning - just remove the header and basic markdown formatting
  let cleanText = text
    .replace(/Travel Advisory Information for [^:]+:\s*/i, '')
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\*/g, '') // Remove italic markdown
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .trim();

  // Remove weather information that shouldn't be in travel advisories
  // But be more selective - only remove the weather section header and description
  cleanText = cleanText
    .replace(/Current Weather Conditions in [^:]+:[\s\S]*$/gi, '') // Remove everything from weather header to end
    .replace(/Weather data retrieved for [^:]+:[\s\S]*$/gi, '')
    .replace(/This weather information can help you plan[\s\S]*$/gi, '')
    // Clean up extra whitespace and empty lines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s*\n+/g, '')
    .trim();

  // Extract travel advisory level if present
  const levelMatch = cleanText.match(/^(Level [1-4]:[^.\n]+)/i);
  const advisoryLevel = levelMatch ? levelMatch[1].trim() : null;
  
  // Remove the level from the main content if found
  if (advisoryLevel) {
    cleanText = cleanText.replace(/^Level [1-4]:[^.\n]+\.?\s*/i, '').trim();
  }

  // Get level-specific styling
  const getLevelStyling = (level: string) => {
    const levelNum = level.match(/Level (\d)/)?.[1];
    switch (levelNum) {
      case '1':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          levelBg: 'bg-green-500',
          levelText: 'text-white',
          icon: '✅'
        };
      case '2':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          levelBg: 'bg-yellow-500',
          levelText: 'text-white',
          icon: '⚠️'
        };
      case '3':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          levelBg: 'bg-orange-500',
          levelText: 'text-white',
          icon: '🚨'
        };
      case '4':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          levelBg: 'bg-red-500',
          levelText: 'text-white',
          icon: '🚫'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          levelBg: 'bg-blue-500',
          levelText: 'text-white',
          icon: '📋'
        };
    }
  };

  const styling = advisoryLevel ? getLevelStyling(advisoryLevel) : getLevelStyling('');

  return [(
    <div key="travel-advisory" className={`mb-6 p-6 rounded-lg shadow-lg border-l-4 ${styling.bgColor} ${styling.borderColor}`}>
      <div className="flex items-center mb-4">
        <span className="text-4xl mr-4">{styling.icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-800">Travel Advisory Information</h3>
          {advisoryLevel && (
            <div className={`inline-block mt-2 px-4 py-2 rounded-full ${styling.levelBg} ${styling.levelText} font-semibold text-sm`}>
              {advisoryLevel}
            </div>
          )}
        </div>
      </div>
      <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
        {cleanText}
      </div>
    </div>
  )];
}



// Function to format weather information for better readability
function formatWeatherText(text: string) {
  // Extract country name and weather data
  const countryMatch = text.match(/Current Weather Conditions in ([^:]+):/);
  const country = countryMatch ? countryMatch[1] : "Unknown Country";
  
  // Extract individual city weather lines and clean them
  const weatherLines = text
    .split('\n')
    .filter(line => line.includes('°C') && line.includes(':'))
    .map(line => line.trim())
    .map(line => line.replace(/\*\*/g, '').replace(/^\*\*|\*\*$/g, '').replace(/^\*|\*$/g, '')); // Remove all markdown formatting
  
  // Extract the description line
  const descriptionMatch = text.match(/This weather information[^.]*\./);
  const description = descriptionMatch ? descriptionMatch[0] : "";

  return (
    <div className="mb-6 p-6 rounded-lg shadow-lg border-l-4 bg-blue-50 border-blue-500">
      <div className="flex items-center mb-4">
        <span className="text-4xl mr-4 text-blue-600">🌤️</span>
        <h3 className="font-bold text-xl text-blue-800">Current Weather in {country}</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {weatherLines.map((line, index) => {
          // Parse the weather line: "City: temp°C, condition, Humidity: X%, Wind: Y km/h"
          const parts = line.split(':');
          if (parts.length < 2) return null;
          
          // Clean the city name of any remaining formatting characters
          const city = parts[0].trim()
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/\*/g, '') // Remove italic markdown  
            .replace(/^-\s*/, '') // Remove leading dashes
            .replace(/^#+\s*/, '') // Remove heading markdown
            .trim();
          const weatherInfo = parts.slice(1).join(':').trim();
          
          // Extract temperature
          const tempMatch = weatherInfo.match(/(\d+)°C/);
          const temperature = tempMatch ? tempMatch[1] : "N/A";
          
          // Extract condition
          const conditionMatch = weatherInfo.match(/°C,\s*([^,]+)/);
          const condition = conditionMatch ? conditionMatch[1].trim() : "N/A";
          
          // Extract humidity
          const humidityMatch = weatherInfo.match(/Humidity:\s*(\d+)%/);
          const humidity = humidityMatch ? humidityMatch[1] : "N/A";
          
          // Extract wind speed
          const windMatch = weatherInfo.match(/Wind:\s*(\d+)\s*km\/h/);
          const windSpeed = windMatch ? windMatch[1] : "N/A";
          
          // Get weather icon based on condition
          const getWeatherIcon = (condition: string) => {
            const lowerCondition = condition.toLowerCase();
            if (lowerCondition.includes('clear sky') || lowerCondition.includes('sunny')) return '☀️';
            if (lowerCondition.includes('clear night')) return '🌙';
            if (lowerCondition.includes('mainly clear')) return '🌤️';
            if (lowerCondition.includes('partly cloudy')) return '⛅';
            if (lowerCondition.includes('overcast') || lowerCondition.includes('cloudy')) return '☁️';
            if (lowerCondition.includes('fog')) return '🌫️';
            if (lowerCondition.includes('drizzle')) return '🌦️';
            if (lowerCondition.includes('rain') || lowerCondition.includes('showers')) return '🌧️';
            if (lowerCondition.includes('snow')) return '❄️';
            if (lowerCondition.includes('thunderstorm')) return '⛈️';
            return '🌤️';
          };
          
          return (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">{city}</h4>
                <span className="text-2xl">{getWeatherIcon(condition)}</span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-medium text-blue-600">{temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Condition:</span>
                  <span className="font-medium capitalize">{condition}</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span className="font-medium">{humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind Speed:</span>
                  <span className="font-medium">{windSpeed} km/h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {description && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-blue-800 text-sm italic">{description}</p>
        </div>
      )}
    </div>
  );
}

export default function AgentChat() {
  const { messages, input, setInput, append } = useChat({
    api: "/api/agent",
    maxSteps: 10,
  });

  return (
    <div className="flex flex-col h-[90vh] max-w-6xl mx-auto">
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-6 ${
              message.role === "user" ? "flex justify-end" : "flex justify-start"
            }`}
          >
            <div
              className={`max-w-[95%] p-6 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white border border-gray-200 shadow-xl"
              }`}
            >
              <div className={`text-sm font-semibold mb-4 ${
                message.role === "user" ? "text-blue-100" : "text-gray-600"
              }`}>
                {message.role === "user" ? "You" : "GoAware"}
              </div>
              
              <div className={`${
                message.role === "user" 
                  ? "text-white" 
                  : "text-gray-800"
              }`}>
                {(() => {
                  // Check for travel advisory with weather
                  if (message.role === "assistant" && message.content.includes("Travel Advisory")) {
                    // More robust weather detection
                    const hasWeatherData = message.content.includes("Current Weather Conditions") || 
                                         message.content.includes("Weather data retrieved") ||
                                         (message.content.includes("°C") && 
                                          (message.content.includes("Humidity") || 
                                           message.content.includes("Wind") ||
                                           message.content.includes("weather information can help")));
                    
                    return (
                      <div className="space-y-4">
                        {formatTravelAdvisoryText(message.content)}
                        {hasWeatherData && (
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            {formatWeatherText(message.content)}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Check for standalone weather
                  if (message.role === "assistant" && 
                      (message.content.includes("Current Weather Conditions") || 
                       message.content.includes("Weather data retrieved") ||
                       (message.content.includes("°C") && message.content.includes("Humidity"))) && 
                      !message.content.includes("Travel Advisory")) {
                    return (
                      <div className="space-y-4">
                        {formatWeatherText(message.content)}
                      </div>
                    );
                  }
                  
                  // Default text rendering
                  return (
                    <div className="leading-relaxed whitespace-pre-wrap text-base">
                      {message.content}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t bg-white shadow-lg">
        <div className="flex gap-4 max-w-6xl">
          <input
            className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-lg"
            placeholder="e.g., What are the travel advisories for India?"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onKeyDown={async (event) => {
              if (event.key === "Enter") {
                append({ content: input, role: "user" });
                setInput("");
              }
            }}
          />
          <button
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold text-lg shadow-lg"
            onClick={() => {
              if (input.trim()) {
                append({ content: input, role: "user" });
                setInput("");
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
