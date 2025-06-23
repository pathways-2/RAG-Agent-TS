"use client";

import { useChat } from "@ai-sdk/react";

// Function to format travel advisory text for better readability
function formatTravelAdvisoryText(text: string) {
  // Remove the header and clean up basic formatting, but preserve all content
  let cleanText = text
    .replace(/Travel Advisory Information for [^:]+:\s*/i, '')
    .replace(/#{1,6}\s/g, '') // Remove markdown headers only
    .trim();

  // Remove weather information that shouldn't be in travel advisory sections
  // Be more aggressive about removing weather data from travel advisories
  cleanText = cleanText
    .replace(/Current Weather Conditions in [^:]+:[\s\S]*?(?=\n\n|$)/gi, '')
    .replace(/Weather data retrieved for [^:]+:[\s\S]*?(?=\n\n|$)/gi, '')
    .replace(/This weather information can help you plan[\s\S]*?(?=\n\n|$)/gi, '')
    .replace(/Temperature:|Condition:|Humidity:|Wind Speed:/gi, '')
    .replace(/\d+°C|partly cloudy|sunny|cloudy|rainy/gi, '')
    .replace(/\*\*Mumbai\*\*|\*\*Delhi\*\*|\*\*Bangalore\*\*/gi, '')
    .trim();

  // Only split on very clear, major section boundaries that are consistent
  const majorSections = [];
  
  // Look for travel advisory level first
  const levelMatch = cleanText.match(/(Level \d+[^.]*\.)/i);
  if (levelMatch) {
    majorSections.push({
      type: 'level',
      title: 'Travel Advisory Level',
      content: levelMatch[1].trim()
    });
    cleanText = cleanText.replace(levelMatch[0], '').trim();
  }

  // Split the remaining content into logical paragraphs/sections
  // Use double line breaks as natural section breaks
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 20 && !p.match(/\d+°C|humidity|wind speed|weather/i)); // Filter out weather fragments

  // Group paragraphs by likely topic based on keywords, but keep original text intact
  const sections = {
    safety: [],
    crime: [],
    health: [],
    entry: [],
    regional: [],
    recommendations: [],
    general: []
  };

  paragraphs.forEach(paragraph => {
    const lowerParagraph = paragraph.toLowerCase();
    
    // Skip if this looks like weather data
    if (lowerParagraph.includes('temperature') || 
        lowerParagraph.includes('humidity') || 
        lowerParagraph.includes('wind speed') ||
        lowerParagraph.match(/\d+°c/)) {
      return;
    }
    
    // More specific categorization to avoid misclassification
    if (lowerParagraph.includes('crime') || lowerParagraph.includes('terrorism') || lowerParagraph.includes('violence') || lowerParagraph.includes('terrorist')) {
      sections.crime.push(paragraph);
    } else if (lowerParagraph.includes('vaccination') || lowerParagraph.includes('disease') || lowerParagraph.includes('medical care') || lowerParagraph.includes('health risk') || lowerParagraph.includes('cdc')) {
      sections.health.push(paragraph);
    } else if (lowerParagraph.includes('visa') || lowerParagraph.includes('passport') || lowerParagraph.includes('entry requirement') || lowerParagraph.includes('border crossing')) {
      sections.entry.push(paragraph);
    } else if (lowerParagraph.includes('do not travel') || lowerParagraph.includes('avoid') || lowerParagraph.includes('regional warning') || lowerParagraph.includes('restricted area')) {
      sections.regional.push(paragraph);
    } else if (lowerParagraph.includes('recommend') || lowerParagraph.includes('should') || lowerParagraph.includes('enroll') || lowerParagraph.includes('step') || lowerParagraph.includes('satellite phone') || lowerParagraph.includes('travel tip') || lowerParagraph.includes('contingency plan')) {
      sections.recommendations.push(paragraph);
    } else if (lowerParagraph.includes('safety') || lowerParagraph.includes('security') || lowerParagraph.includes('emergency') || lowerParagraph.includes('government services')) {
      sections.safety.push(paragraph);
    } else {
      sections.general.push(paragraph);
    }
  });

  // Build the final sections array, preserving original text
  const finalSections = [];
  
  // Add the level section if it exists
  if (majorSections.length > 0) {
    finalSections.push(...majorSections);
  }

  // Add other sections only if they have content
  if (sections.safety.length > 0) {
    finalSections.push({
      type: 'safety',
      title: 'Safety & Security Information',
      content: sections.safety.join('\n\n')
    });
  }

  if (sections.crime.length > 0) {
    finalSections.push({
      type: 'security',
      title: 'Crime & Terrorism',
      content: sections.crime.join('\n\n')
    });
  }

  if (sections.regional.length > 0) {
    finalSections.push({
      type: 'regional',
      title: 'Regional Warnings & Restricted Areas',
      content: sections.regional.join('\n\n')
    });
  }

  if (sections.recommendations.length > 0) {
    finalSections.push({
      type: 'recommendations',
      title: 'Travel Recommendations',
      content: sections.recommendations.join('\n\n')
    });
  }

  if (sections.health.length > 0) {
    finalSections.push({
      type: 'health',
      title: 'Health & Medical Information',
      content: sections.health.join('\n\n')
    });
  }

  if (sections.entry.length > 0) {
    finalSections.push({
      type: 'entry',
      title: 'Entry Requirements',
      content: sections.entry.join('\n\n')
    });
  }

  // Combine all general content into Additional Information, but filter out weather
  if (sections.general.length > 0) {
    const cleanGeneral = sections.general
      .filter(content => !content.toLowerCase().match(/temperature|humidity|wind|weather|\d+°c/))
      .join('\n\n');
    
    if (cleanGeneral.trim().length > 20) {
      finalSections.push({
        type: 'general',
        title: 'Additional Information',
        content: cleanGeneral
      });
    }
  }

  // If we don't have enough sections or sectioning failed, show original content cleanly
  if (finalSections.length <= 1) {
    // But still clean out weather data from the fallback
    const cleanedFallback = cleanText
      .replace(/\*\*Mumbai\*\*[\s\S]*?wind speed/gi, '')
      .replace(/\*\*Delhi\*\*[\s\S]*?wind speed/gi, '')
      .replace(/\*\*Bangalore\*\*[\s\S]*?wind speed/gi, '')
      .replace(/This weather information[\s\S]*?attractions\./gi, '')
      .trim();
    
    return [(
      <div key="original" className="mb-6 p-6 rounded-lg shadow-lg border-l-4 bg-gray-50 border-gray-500">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4 text-gray-600">📋</span>
          <h3 className="font-bold text-xl text-gray-800">Travel Advisory Information</h3>
        </div>
        <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
          {cleanedFallback}
        </div>
      </div>
    )];
  }

  // Render sections with minimal formatting to preserve accuracy
  return finalSections.map((section, index) => {
    const sectionStyle = "mb-6 p-6 rounded-lg shadow-lg border-l-4";
    const headerStyle = "flex items-center mb-4";
    const iconStyle = "text-4xl mr-4";
    const titleStyle = "font-bold text-xl";

    // Simple content rendering that preserves original text
    const renderContent = (content: string) => {
      return (
        <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
          {content}
        </div>
      );
    };

    switch (section.type) {
      case 'level':
        return (
          <div key={index} className={`${sectionStyle} bg-red-50 border-red-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-red-600`}>🚨</span>
              <h3 className={`${titleStyle} text-red-800`}>{section.title}</h3>
            </div>
            <div className="bg-red-100 p-4 rounded-lg font-semibold text-red-900 text-lg">
              {section.content}
            </div>
          </div>
        );

      case 'safety':
        return (
          <div key={index} className={`${sectionStyle} bg-yellow-50 border-yellow-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-yellow-600`}>🔐</span>
              <h3 className={`${titleStyle} text-yellow-800`}>{section.title}</h3>
            </div>
            {renderContent(section.content)}
          </div>
        );

      case 'security':
        return (
          <div key={index} className={`${sectionStyle} bg-orange-50 border-orange-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-orange-600`}>⚠️</span>
              <h3 className={`${titleStyle} text-orange-800`}>{section.title}</h3>
            </div>
            {renderContent(section.content)}
          </div>
        );

      case 'recommendations':
        return (
          <div key={index} className={`${sectionStyle} bg-blue-50 border-blue-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-blue-600`}>💡</span>
              <h3 className={`${titleStyle} text-blue-800`}>{section.title}</h3>
            </div>
            {renderContent(section.content)}
          </div>
        );

      case 'regional':
        return (
          <div key={index} className={`${sectionStyle} bg-purple-50 border-purple-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-purple-600`}>🌍</span>
              <h3 className={`${titleStyle} text-purple-800`}>{section.title}</h3>
            </div>
            {renderContent(section.content)}
          </div>
        );

      case 'health':
        return (
          <div key={index} className={`${sectionStyle} bg-green-50 border-green-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-green-600`}>🏥</span>
              <h3 className={`${titleStyle} text-green-800`}>{section.title}</h3>
            </div>
            {renderContent(section.content)}
          </div>
        );

      case 'entry':
        return (
          <div key={index} className={`${sectionStyle} bg-pink-50 border-pink-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-pink-600`}>🛂</span>
              <h3 className={`${titleStyle} text-pink-800`}>{section.title}</h3>
            </div>
            {renderContent(section.content)}
          </div>
        );

      default:
        return (
          <div key={index} className={`${sectionStyle} bg-gray-50 border-gray-500`}>
            <div className={headerStyle}>
              <span className={`${iconStyle} text-gray-600`}>📋</span>
              <h3 className={`${titleStyle} text-gray-800`}>{section.title}</h3>
            </div>
            {renderContent(section.content)}
          </div>
        );
    }
  });
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
    .map(line => line.replace(/\*\*/g, '')); // Remove markdown bold formatting
  
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
          const city = parts[0].trim().replace(/\*\*/g, '').replace(/^-\s*/, '').trim();
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
            if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return '☀️';
            if (lowerCondition.includes('cloudy')) return '☁️';
            if (lowerCondition.includes('partly')) return '⛅';
            if (lowerCondition.includes('rainy') || lowerCondition.includes('rain')) return '🌧️';
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
                {message.role === "assistant" && message.content.includes("Travel Advisory") ? (
                  <div className="space-y-4">
                    {formatTravelAdvisoryText(message.content)}
                    {message.content.includes("Current Weather Conditions") && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        {formatWeatherText(message.content)}
                      </div>
                    )}
                  </div>
                ) : message.role === "assistant" && message.content.includes("Current Weather Conditions") && !message.content.includes("Travel Advisory") ? (
                  <div className="space-y-4">
                    {formatWeatherText(message.content)}
                  </div>
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap text-base">
                    {message.content}
                  </div>
                )}
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
