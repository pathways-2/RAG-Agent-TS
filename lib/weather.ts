// Weather service for real-time weather data using Open-Meteo API (Free, no API key required)

interface WeatherData {
  value: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon?: string;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
}

/**
 * Convert WMO weather codes to human-readable descriptions
 * Based on WMO Weather interpretation codes from Open-Meteo docs
 */
function getWeatherDescription(code: number, isDay: boolean): string {
  const descriptions: Record<number, string> = {
    0: isDay ? "Clear sky" : "Clear night",
    1: isDay ? "Mainly clear" : "Mainly clear night",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle", 
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  
  return descriptions[code] || "Unknown weather";
}

/**
 * Get real-time weather data for a specific location using Open-Meteo API
 */
export async function getRealWeather({ 
  lat, 
  lon, 
  unit = "C" 
}: { 
  lat: number; 
  lon: number; 
  unit?: "C" | "F" 
}): Promise<WeatherData> {
  try {
    // Open-Meteo API - completely free, no API key required!
    const tempUnit = unit === "C" ? "celsius" : "fahrenheit";
    const windUnit = "kmh"; // Always use km/h for consistency
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
      return getMockWeather({ lat, lon, unit });
    }
    
    const data: OpenMeteoResponse = await response.json();
    const current = data.current;
    
    return {
      value: Math.round(current.temperature_2m),
      description: getWeatherDescription(current.weather_code, current.is_day === 1),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      icon: current.weather_code.toString() // Use weather code as icon identifier
    };
    
  } catch (error) {
    console.error('Error fetching weather data from Open-Meteo:', error);
    return getMockWeather({ lat, lon, unit });
  }
}

/**
 * Fallback mock weather function (same as before)
 */
function getMockWeather({ lat, lon, unit = "C" }: { lat: number; lon: number; unit?: "C" | "F" }): WeatherData {
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

/**
 * Get weather for multiple cities in a country
 */
export async function getCountryWeatherData(country: string, cities: string[]): Promise<Array<{
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon?: string;
}>> {
  const weatherData = [];
  
  for (const city of cities) {
    const coords = getCityCoordinates(city, country);
    const weather = await getRealWeather({ lat: coords.lat, lon: coords.lon, unit: "C" });
    
    weatherData.push({
      city,
      temperature: weather.value,
      condition: weather.description,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      icon: weather.icon
    });
  }
  
  return weatherData;
}

/**
 * Get top cities for a country
 */
export function getTopCities(country: string): string[] {
  const topCities: Record<string, string[]> = {
    // Major economies
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
    "south korea": ["Seoul", "Busan", "Incheon"],
    "russia": ["Moscow", "St. Petersburg", "Novosibirsk"],
    "brazil": ["São Paulo", "Rio de Janeiro", "Brasília"],
    "mexico": ["Mexico City", "Guadalajara", "Monterrey"],
    "italy": ["Rome", "Milan", "Naples"],
    "spain": ["Madrid", "Barcelona", "Valencia"],
    "netherlands": ["Amsterdam", "Rotterdam", "The Hague"],
    "belgium": ["Brussels", "Antwerp", "Ghent"],
    "sweden": ["Stockholm", "Gothenburg", "Malmö"],
    "norway": ["Oslo", "Bergen", "Trondheim"],
    "denmark": ["Copenhagen", "Aarhus", "Odense"],
    "finland": ["Helsinki", "Tampere", "Turku"],
    "poland": ["Warsaw", "Krakow", "Gdansk"],
    "turkey": ["Istanbul", "Ankara", "Izmir"],
    "israel": ["Tel Aviv", "Jerusalem", "Haifa"],
    "south africa": ["Cape Town", "Johannesburg", "Durban"],
    "egypt": ["Cairo", "Alexandria", "Giza"],
    "nigeria": ["Lagos", "Abuja", "Kano"],
    "kenya": ["Nairobi", "Mombasa", "Kisumu"],
    "morocco": ["Casablanca", "Rabat", "Marrakech"],
    "algeria": ["Algiers", "Oran", "Constantine"],
    "tunisia": ["Tunis", "Sfax", "Sousse"],
    "libya": ["Tripoli", "Benghazi", "Misrata"],
    "ethiopia": ["Addis Ababa", "Dire Dawa", "Mekelle"],
    "ghana": ["Accra", "Kumasi", "Tamale"],
    "ivory coast": ["Abidjan", "Bouaké", "Daloa"],
    "senegal": ["Dakar", "Thiès", "Kaolack"],
    "mali": ["Bamako", "Sikasso", "Mopti"],
    "burkina faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"],
    "niger": ["Niamey", "Zinder", "Maradi"],
    "chad": ["N'Djamena", "Moundou", "Sarh"],
    "cameroon": ["Yaoundé", "Douala", "Garoua"],
    "central african republic": ["Bangui", "Bimbo", "Berbérati"],
    "democratic republic of congo": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi"],
    "republic of congo": ["Brazzaville", "Pointe-Noire", "Dolisie"],
    "gabon": ["Libreville", "Port-Gentil", "Franceville"],
    "equatorial guinea": ["Malabo", "Bata", "Ebebiyin"],
    "sao tome and principe": ["São Tomé", "Santo António", "Neves"],
    "cape verde": ["Praia", "Mindelo", "Santa Maria"],
    "guinea-bissau": ["Bissau", "Bafatá", "Gabú"],
    "guinea": ["Conakry", "Nzérékoré", "Kankan"],
    "sierra leone": ["Freetown", "Bo", "Kenema"],
    "liberia": ["Monrovia", "Gbarnga", "Kakata"],
    "madagascar": ["Antananarivo", "Toamasina", "Antsirabe"],
    "mauritius": ["Port Louis", "Beau Bassin-Rose Hill", "Vacoas-Phoenix"],
    "seychelles": ["Victoria", "Anse Boileau", "Beau Vallon"],
    "comoros": ["Moroni", "Mutsamudu", "Fomboni"],
    "djibouti": ["Djibouti City", "Ali Sabieh", "Dikhil"],
    "eritrea": ["Asmara", "Keren", "Massawa"],
    "somalia": ["Mogadishu", "Hargeisa", "Bosaso"],
    "sudan": ["Khartoum", "Omdurman", "Port Sudan"],
    "south sudan": ["Juba", "Wau", "Malakal"],
    "uganda": ["Kampala", "Gulu", "Lira"],
    "rwanda": ["Kigali", "Butare", "Gitarama"],
    "burundi": ["Gitega", "Bujumbura", "Muyinga"],
    "tanzania": ["Dar es Salaam", "Mwanza", "Arusha"],
    "zambia": ["Lusaka", "Kitwe", "Ndola"],
    "malawi": ["Lilongwe", "Blantyre", "Mzuzu"],
    "mozambique": ["Maputo", "Matola", "Beira"],
    "zimbabwe": ["Harare", "Bulawayo", "Chitungwiza"],
    "botswana": ["Gaborone", "Francistown", "Molepolole"],
    "namibia": ["Windhoek", "Rundu", "Walvis Bay"],
    "angola": ["Luanda", "Huambo", "Lobito"],
    "argentina": ["Buenos Aires", "Córdoba", "Rosario"],
    "chile": ["Santiago", "Valparaíso", "Concepción"],
    "peru": ["Lima", "Arequipa", "Trujillo"],
    "colombia": ["Bogotá", "Medellín", "Cali"],
    "venezuela": ["Caracas", "Maracaibo", "Valencia"],
    "ecuador": ["Quito", "Guayaquil", "Cuenca"],
    "bolivia": ["La Paz", "Santa Cruz", "Cochabamba"],
    "paraguay": ["Asunción", "Ciudad del Este", "San Lorenzo"],
    "uruguay": ["Montevideo", "Salto", "Paysandú"],
    "guyana": ["Georgetown", "Linden", "New Amsterdam"],
    "suriname": ["Paramaribo", "Lelydorp", "Nieuw Nickerie"],
    "french guiana": ["Cayenne", "Saint-Laurent-du-Maroni", "Kourou"],
    
    // Caribbean
    "bahamas": ["Nassau", "Freeport", "West End"],
    "barbados": ["Bridgetown", "Speightstown", "Oistins"],
    "jamaica": ["Kingston", "Spanish Town", "Portmore"],
    "trinidad and tobago": ["Port of Spain", "San Fernando", "Chaguanas"],
    "cuba": ["Havana", "Santiago de Cuba", "Camagüey"],
    "haiti": ["Port-au-Prince", "Cap-Haïtien", "Gonaïves"],
    "dominican republic": ["Santo Domingo", "Santiago", "La Romana"],
    "puerto rico": ["San Juan", "Bayamón", "Carolina"],
    "grenada": ["St. George's", "Gouyave", "Grenville"],
    "saint lucia": ["Castries", "Bisée", "Vieux Fort"],
    "saint vincent and the grenadines": ["Kingstown", "Georgetown", "Barrouallie"],
    "antigua and barbuda": ["St. John's", "All Saints", "Liberta"],
    "dominica": ["Roseau", "Portsmouth", "Marigot"],
    "saint kitts and nevis": ["Basseterre", "Charlestown", "Monkey Hill"],
    
    // Asia
    "thailand": ["Bangkok", "Phuket", "Chiang Mai"],
    "vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang"],
    "singapore": ["Singapore", "Jurong", "Woodlands"],
    "malaysia": ["Kuala Lumpur", "George Town", "Ipoh"],
    "indonesia": ["Jakarta", "Surabaya", "Medan"],
    "philippines": ["Manila", "Quezon City", "Davao"],
    "cambodia": ["Phnom Penh", "Siem Reap", "Battambang"],
    "laos": ["Vientiane", "Luang Prabang", "Savannakhet"],
    "myanmar": ["Yangon", "Mandalay", "Naypyidaw"],
    "bangladesh": ["Dhaka", "Chittagong", "Sylhet"],
    "sri lanka": ["Colombo", "Kandy", "Galle"],
    "nepal": ["Kathmandu", "Pokhara", "Lalitpur"],
    "bhutan": ["Thimphu", "Phuntsholing", "Punakha"],
    "maldives": ["Malé", "Addu City", "Fuvahmulah"],
    "afghanistan": ["Kabul", "Kandahar", "Herat"],
    "iran": ["Tehran", "Mashhad", "Isfahan"],
    "iraq": ["Baghdad", "Basra", "Mosul"],
    "syria": ["Damascus", "Aleppo", "Homs"],
    "lebanon": ["Beirut", "Tripoli", "Sidon"],
    "jordan": ["Amman", "Zarqa", "Irbid"],
    "saudi arabia": ["Riyadh", "Jeddah", "Mecca"],
    "uae": ["Dubai", "Abu Dhabi", "Sharjah"],
    "united arab emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
    "qatar": ["Doha", "Al Rayyan", "Umm Salal"],
    "kuwait": ["Kuwait City", "Al Ahmadi", "Hawalli"],
    "bahrain": ["Manama", "Riffa", "Muharraq"],
    "oman": ["Muscat", "Seeb", "Salalah"],
    "yemen": ["Sana'a", "Aden", "Taiz"],
    "mongolia": ["Ulaanbaatar", "Erdenet", "Darkhan"],
    "kazakhstan": ["Almaty", "Nur-Sultan", "Shymkent"],
    "uzbekistan": ["Tashkent", "Samarkand", "Namangan"],
    "kyrgyzstan": ["Bishkek", "Osh", "Jalal-Abad"],
    "tajikistan": ["Dushanbe", "Khujand", "Kulob"],
    "turkmenistan": ["Ashgabat", "Turkmenbashi", "Daşoguz"],
    
    // Europe
    "greece": ["Athens", "Thessaloniki", "Patras"],
    "austria": ["Vienna", "Salzburg", "Innsbruck"],
    "czech republic": ["Prague", "Brno", "Ostrava"],
    "slovakia": ["Bratislava", "Košice", "Prešov"],
    "hungary": ["Budapest", "Debrecen", "Szeged"],
    "romania": ["Bucharest", "Cluj-Napoca", "Timișoara"],
    "bulgaria": ["Sofia", "Plovdiv", "Varna"],
    "croatia": ["Zagreb", "Split", "Rijeka"],
    "serbia": ["Belgrade", "Novi Sad", "Niš"],
    "bosnia and herzegovina": ["Sarajevo", "Banja Luka", "Tuzla"],
    "montenegro": ["Podgorica", "Nikšić", "Pljevlja"],
    "north macedonia": ["Skopje", "Bitola", "Kumanovo"],
    "albania": ["Tirana", "Durrës", "Vlorë"],
    "slovenia": ["Ljubljana", "Maribor", "Celje"],
    "estonia": ["Tallinn", "Tartu", "Narva"],
    "latvia": ["Riga", "Daugavpils", "Liepāja"],
    "lithuania": ["Vilnius", "Kaunas", "Klaipėda"],
    "belarus": ["Minsk", "Gomel", "Mogilev"],
    "ukraine": ["Kyiv", "Kharkiv", "Odesa"],
    "moldova": ["Chișinău", "Tiraspol", "Bălți"],
    "georgia": ["Tbilisi", "Batumi", "Kutaisi"],
    "armenia": ["Yerevan", "Gyumri", "Vanadzor"],
    "azerbaijan": ["Baku", "Ganja", "Sumgayit"],
    "cyprus": ["Nicosia", "Limassol", "Larnaca"],
    "malta": ["Valletta", "Birkirkara", "Mosta"],
    "iceland": ["Reykjavik", "Kópavogur", "Hafnarfjörður"],
    "ireland": ["Dublin", "Cork", "Limerick"],
    "portugal": ["Lisbon", "Porto", "Vila Nova de Gaia"],
    "luxembourg": ["Luxembourg City", "Esch-sur-Alzette", "Differdange"],
    "liechtenstein": ["Vaduz", "Schaan", "Balzers"],
    "monaco": ["Monaco", "Monte Carlo", "La Condamine"],
    "andorra": ["Andorra la Vella", "Escaldes-Engordany", "Encamp"],
    "san marino": ["San Marino", "Serravalle", "Borgo Maggiore"],
    "vatican city": ["Vatican City", "St. Peter's", "Sistine Chapel"],
    
    // Oceania
    "new zealand": ["Auckland", "Wellington", "Christchurch"],
    "fiji": ["Suva", "Nadi", "Lautoka"],
    "papua new guinea": ["Port Moresby", "Lae", "Mount Hagen"],
    "solomon islands": ["Honiara", "Gizo", "Auki"],
    "vanuatu": ["Port Vila", "Luganville", "Isangel"],
    "samoa": ["Apia", "Asau", "Mulifanua"],
    "tonga": ["Nuku'alofa", "Neiafu", "Haveluloto"],
    "kiribati": ["Tarawa", "Betio", "Bikenibeu"],
    "tuvalu": ["Funafuti", "Savave", "Tanrake"],
    "nauru": ["Yaren", "Baiti", "Anabar"],
    "palau": ["Ngerulmud", "Koror", "Airai"],
    "marshall islands": ["Majuro", "Ebeye", "Arno"],
    "micronesia": ["Palikir", "Weno", "Tofol"],
    
    // Country name variations and aliases
    "america": ["New York", "Los Angeles", "Chicago"],
    "britain": ["London", "Manchester", "Birmingham"],
    "england": ["London", "Manchester", "Birmingham"],
    "holland": ["Amsterdam", "Rotterdam", "The Hague"],
    "persia": ["Tehran", "Mashhad", "Isfahan"],
    "burma": ["Yangon", "Mandalay", "Naypyidaw"],
    "ceylon": ["Colombo", "Kandy", "Galle"],
    "siam": ["Bangkok", "Phuket", "Chiang Mai"],
    "czechoslovakia": ["Prague", "Brno", "Ostrava"],
    "yugoslavia": ["Belgrade", "Zagreb", "Sarajevo"],
    "soviet union": ["Moscow", "St. Petersburg", "Novosibirsk"],
    "ussr": ["Moscow", "St. Petersburg", "Novosibirsk"],
    "korea": ["Seoul", "Busan", "Incheon"],
    "republic of korea": ["Seoul", "Busan", "Incheon"],
    "dprk": ["Pyongyang", "Hamhung", "Chongjin"],
    "north korea": ["Pyongyang", "Hamhung", "Chongjin"],
    "democratic people's republic of korea": ["Pyongyang", "Hamhung", "Chongjin"],
    "emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
    "congo": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi"],
    "zaire": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi"],
    "rhodesia": ["Harare", "Bulawayo", "Chitungwiza"],
    "abyssinia": ["Addis Ababa", "Dire Dawa", "Mekelle"],
    "formosa": ["Taipei", "Kaohsiung", "Taichung"],
    "taiwan": ["Taipei", "Kaohsiung", "Taichung"],
    "republic of china": ["Taipei", "Kaohsiung", "Taichung"],
    "people's republic of china": ["Beijing", "Shanghai", "Guangzhou"],
    "mainland china": ["Beijing", "Shanghai", "Guangzhou"],
    "prc": ["Beijing", "Shanghai", "Guangzhou"],
    "roc": ["Taipei", "Kaohsiung", "Taichung"],
    
    // Common alternative spellings
    "phillipines": ["Manila", "Quezon City", "Davao"],
    "philipines": ["Manila", "Quezon City", "Davao"],
    "phillippines": ["Manila", "Quezon City", "Davao"],
    "viet nam": ["Ho Chi Minh City", "Hanoi", "Da Nang"],
    "lao": ["Vientiane", "Luang Prabang", "Savannakhet"],
    "kampuchea": ["Phnom Penh", "Siem Reap", "Battambang"],
    "khmer republic": ["Phnom Penh", "Siem Reap", "Battambang"],
    
    // Regional groupings
    "balkans": ["Belgrade", "Zagreb", "Sarajevo"],
    "scandinavia": ["Stockholm", "Oslo", "Copenhagen"],
    "nordic countries": ["Stockholm", "Oslo", "Copenhagen"],
    "benelux": ["Brussels", "Amsterdam", "Luxembourg City"],
    "maghreb": ["Casablanca", "Algiers", "Tunis"],
    "levant": ["Beirut", "Damascus", "Amman"],
    "gulf states": ["Dubai", "Doha", "Kuwait City"],
    "persian gulf": ["Dubai", "Doha", "Kuwait City"],
    "arabian gulf": ["Dubai", "Doha", "Kuwait City"],
    "horn of africa": ["Addis Ababa", "Mogadishu", "Asmara"],
    "east africa": ["Nairobi", "Dar es Salaam", "Kampala"],
    "west africa": ["Lagos", "Accra", "Dakar"],
    "central africa": ["Kinshasa", "Yaoundé", "Bangui"],
    "southern africa": ["Johannesburg", "Cape Town", "Harare"],
    "north africa": ["Cairo", "Casablanca", "Algiers"],
    "sub-saharan africa": ["Lagos", "Nairobi", "Johannesburg"],
    "sahel": ["Bamako", "Niamey", "N'Djamena"],
    
    // General regions
    "africa": ["Cairo", "Lagos", "Johannesburg"],
    "middle east": ["Dubai", "Riyadh", "Tehran"],
    "southeast asia": ["Bangkok", "Singapore", "Jakarta"],
    "south asia": ["Mumbai", "Delhi", "Dhaka"],
    "east asia": ["Beijing", "Tokyo", "Seoul"],
    "central asia": ["Almaty", "Tashkent", "Bishkek"],
    "western europe": ["London", "Paris", "Berlin"],
    "eastern europe": ["Moscow", "Warsaw", "Prague"],
    "southern europe": ["Rome", "Madrid", "Athens"],
    "northern europe": ["Stockholm", "Oslo", "Helsinki"],
    "north america": ["New York", "Toronto", "Mexico City"],
    "south america": ["São Paulo", "Buenos Aires", "Lima"],
    "central america": ["Mexico City", "Guatemala City", "San José"],
    "caribbean": ["Havana", "Kingston", "San Juan"],
    "oceania": ["Sydney", "Auckland", "Suva"],
    "pacific islands": ["Suva", "Apia", "Nuku'alofa"],
    // Add more countries as needed
  };
  
  return topCities[country.toLowerCase()] || [country];
}

/**
 * Get city coordinates (moved from route.ts for reusability)
 */
function getCityCoordinates(city: string, country: string): { lat: number; lon: number } {
  // Comprehensive city coordinates mapping
  const cityCoords: Record<string, { lat: number; lon: number }> = {
    // Major countries
    "tokyo,japan": { lat: 35.6762, lon: 139.6503 },
    "osaka,japan": { lat: 34.6937, lon: 135.5023 },
    "kyoto,japan": { lat: 35.0116, lon: 135.7681 },
    
    "mumbai,india": { lat: 19.0760, lon: 72.8777 },
    "delhi,india": { lat: 28.7041, lon: 77.1025 },
    "bangalore,india": { lat: 12.9716, lon: 77.5946 },
    
    "karachi,pakistan": { lat: 24.8607, lon: 67.0011 },
    "lahore,pakistan": { lat: 31.5497, lon: 74.3436 },
    "islamabad,pakistan": { lat: 33.6844, lon: 73.0479 },
    
    // Europe
    "zurich,switzerland": { lat: 47.3769, lon: 8.5417 },
    "geneva,switzerland": { lat: 46.2044, lon: 6.1432 },
    "basel,switzerland": { lat: 47.5596, lon: 7.5886 },
    
    "berlin,germany": { lat: 52.5200, lon: 13.4050 },
    "munich,germany": { lat: 48.1351, lon: 11.5820 },
    "hamburg,germany": { lat: 53.5511, lon: 9.9937 },
    
    "paris,france": { lat: 48.8566, lon: 2.3522 },
    "lyon,france": { lat: 45.7640, lon: 4.8357 },
    "marseille,france": { lat: 43.2965, lon: 5.3698 },
    
    "london,uk": { lat: 51.5074, lon: -0.1278 },
    "manchester,uk": { lat: 53.4808, lon: -2.2426 },
    "birmingham,uk": { lat: 52.4862, lon: -1.8904 },
    
    "london,united kingdom": { lat: 51.5074, lon: -0.1278 },
    "manchester,united kingdom": { lat: 53.4808, lon: -2.2426 },
    "birmingham,united kingdom": { lat: 52.4862, lon: -1.8904 },
    
    // Americas
    "new york,usa": { lat: 40.7128, lon: -74.0060 },
    "los angeles,usa": { lat: 34.0522, lon: -118.2437 },
    "chicago,usa": { lat: 41.8781, lon: -87.6298 },
    
    "new york,united states": { lat: 40.7128, lon: -74.0060 },
    "los angeles,united states": { lat: 34.0522, lon: -118.2437 },
    "chicago,united states": { lat: 41.8781, lon: -87.6298 },
    
    "toronto,canada": { lat: 43.6532, lon: -79.3832 },
    "vancouver,canada": { lat: 49.2827, lon: -123.1207 },
    "montreal,canada": { lat: 45.5017, lon: -73.5673 },
    
    // Asia Pacific
    "beijing,china": { lat: 39.9042, lon: 116.4074 },
    "shanghai,china": { lat: 31.2304, lon: 121.4737 },
    "guangzhou,china": { lat: 23.1291, lon: 113.2644 },
    
    "sydney,australia": { lat: -33.8688, lon: 151.2093 },
    "melbourne,australia": { lat: -37.8136, lon: 144.9631 },
    "brisbane,australia": { lat: -27.4698, lon: 153.0251 },
    
    "seoul,south korea": { lat: 37.5665, lon: 126.9780 },
    "busan,south korea": { lat: 35.1796, lon: 129.0756 },
    "incheon,south korea": { lat: 37.4563, lon: 126.7052 },
    
    // Greece
    "athens,greece": { lat: 37.9838, lon: 23.7275 },
    "thessaloniki,greece": { lat: 40.6401, lon: 22.9444 },
    "patras,greece": { lat: 38.2466, lon: 21.7346 },
    
    // Austria
    "vienna,austria": { lat: 48.2082, lon: 16.3738 },
    "salzburg,austria": { lat: 47.8095, lon: 13.0550 },
    "innsbruck,austria": { lat: 47.2692, lon: 11.4041 },
    
    // Yemen
    "sana'a,yemen": { lat: 15.3694, lon: 44.1910 },
    "aden,yemen": { lat: 12.7794, lon: 45.0367 },
    "taiz,yemen": { lat: 13.5795, lon: 44.0209 },
    
    // Caribbean
    "havana,cuba": { lat: 23.1136, lon: -82.3666 },
    "santiago de cuba,cuba": { lat: 20.0247, lon: -75.8219 },
    "camagüey,cuba": { lat: 21.3794, lon: -77.9169 },
    
    "port-au-prince,haiti": { lat: 18.5944, lon: -72.3074 },
    "cap-haïtien,haiti": { lat: 19.7570, lon: -72.2014 },
    "gonaïves,haiti": { lat: 19.4515, lon: -72.6890 },
    
    // Seychelles
    "victoria,seychelles": { lat: -4.6191, lon: 55.4513 },
    "anse boileau,seychelles": { lat: -4.7167, lon: 55.4833 },
    "beau vallon,seychelles": { lat: -4.6167, lon: 55.4333 },
    
    // Thailand
    "bangkok,thailand": { lat: 13.7563, lon: 100.5018 },
    "phuket,thailand": { lat: 7.8804, lon: 98.3923 },
    "chiang mai,thailand": { lat: 18.7883, lon: 98.9853 },
    
    // Senegal
    "dakar,senegal": { lat: 14.7167, lon: -17.4677 },
    "thiès,senegal": { lat: 14.7886, lon: -16.9260 },
    "kaolack,senegal": { lat: 14.1512, lon: -16.0728 },
    
    // Caribbean (Bahamas - CRITICAL FIX)
    "nassau,bahamas": { lat: 25.0443, lon: -77.3504 },
    "freeport,bahamas": { lat: 26.5312, lon: -78.6956 },
    "west end,bahamas": { lat: 26.6861, lon: -78.9764 },
    
    // Other Caribbean
    "bridgetown,barbados": { lat: 13.1139, lon: -59.5989 },
    "speightstown,barbados": { lat: 13.2500, lon: -59.6333 },
    "oistins,barbados": { lat: 13.0667, lon: -59.5333 },
    
    "kingston,jamaica": { lat: 17.9970, lon: -76.7936 },
    "spanish town,jamaica": { lat: 17.9911, lon: -76.9574 },
    "portmore,jamaica": { lat: 17.9500, lon: -76.8833 },
    
    "port of spain,trinidad and tobago": { lat: 10.6596, lon: -61.5089 },
    "san fernando,trinidad and tobago": { lat: 10.2796, lon: -61.4589 },
    "chaguanas,trinidad and tobago": { lat: 10.5167, lon: -61.4167 },
    
    "santo domingo,dominican republic": { lat: 18.4861, lon: -69.9312 },
    "santiago,dominican republic": { lat: 19.4517, lon: -70.6970 },
    "la romana,dominican republic": { lat: 18.4273, lon: -68.9728 },
    
    // Major European cities
    "moscow,russia": { lat: 55.7558, lon: 37.6176 },
    "st. petersburg,russia": { lat: 59.9311, lon: 30.3609 },
    "novosibirsk,russia": { lat: 55.0084, lon: 82.9357 },
    
    "são paulo,brazil": { lat: -23.5505, lon: -46.6333 },
    "rio de janeiro,brazil": { lat: -22.9068, lon: -43.1729 },
    "brasília,brazil": { lat: -15.8267, lon: -47.9218 },
    
    "mexico city,mexico": { lat: 19.4326, lon: -99.1332 },
    "guadalajara,mexico": { lat: 20.6597, lon: -103.3496 },
    "monterrey,mexico": { lat: 25.6866, lon: -100.3161 },
    
    "rome,italy": { lat: 41.9028, lon: 12.4964 },
    "milan,italy": { lat: 45.4642, lon: 9.1900 },
    "naples,italy": { lat: 40.8518, lon: 14.2681 },
    
    "madrid,spain": { lat: 40.4168, lon: -3.7038 },
    "barcelona,spain": { lat: 41.3851, lon: 2.1734 },
    "valencia,spain": { lat: 39.4699, lon: -0.3763 },
    
    "amsterdam,netherlands": { lat: 52.3676, lon: 4.9041 },
    "rotterdam,netherlands": { lat: 51.9244, lon: 4.4777 },
    "the hague,netherlands": { lat: 52.0705, lon: 4.3007 },
    
    // Major Asian cities
    "singapore,singapore": { lat: 1.3521, lon: 103.8198 },
    "jurong,singapore": { lat: 1.3404, lon: 103.7090 },
    "woodlands,singapore": { lat: 1.4382, lon: 103.7890 },
    
    "kuala lumpur,malaysia": { lat: 3.1390, lon: 101.6869 },
    "george town,malaysia": { lat: 5.4164, lon: 100.3327 },
    "ipoh,malaysia": { lat: 4.5975, lon: 101.0901 },
    
    "jakarta,indonesia": { lat: -6.2088, lon: 106.8456 },
    "surabaya,indonesia": { lat: -7.2575, lon: 112.7521 },
    "medan,indonesia": { lat: 3.5952, lon: 98.6722 },
    
    "manila,philippines": { lat: 14.5995, lon: 120.9842 },
    "quezon city,philippines": { lat: 14.6760, lon: 121.0437 },
    "davao,philippines": { lat: 7.1907, lon: 125.4553 },
    
    "ho chi minh city,vietnam": { lat: 10.8231, lon: 106.6297 },
    "hanoi,vietnam": { lat: 21.0285, lon: 105.8542 },
    "da nang,vietnam": { lat: 16.0471, lon: 108.2068 },
    
    "dhaka,bangladesh": { lat: 23.8103, lon: 90.4125 },
    "chittagong,bangladesh": { lat: 22.3569, lon: 91.7832 },
    "sylhet,bangladesh": { lat: 24.8949, lon: 91.8687 },
    
    "colombo,sri lanka": { lat: 6.9271, lon: 79.8612 },
    "kandy,sri lanka": { lat: 7.2906, lon: 80.6337 },
    "galle,sri lanka": { lat: 6.0535, lon: 80.2210 },
    
    "kathmandu,nepal": { lat: 27.7172, lon: 85.3240 },
    "pokhara,nepal": { lat: 28.2096, lon: 83.9856 },
    "lalitpur,nepal": { lat: 27.6588, lon: 85.3247 },
    
    // Middle East
    "dubai,uae": { lat: 25.2048, lon: 55.2708 },
    "abu dhabi,uae": { lat: 24.4539, lon: 54.3773 },
    "sharjah,uae": { lat: 25.3463, lon: 55.4209 },
    
    "doha,qatar": { lat: 25.2854, lon: 51.5310 },
    "al rayyan,qatar": { lat: 25.2919, lon: 51.4240 },
    "umm salal,qatar": { lat: 25.4057, lon: 51.4064 },
    
    "riyadh,saudi arabia": { lat: 24.7136, lon: 46.6753 },
    "jeddah,saudi arabia": { lat: 21.4858, lon: 39.1925 },
    "mecca,saudi arabia": { lat: 21.3891, lon: 39.8579 },
    
    "tehran,iran": { lat: 35.6892, lon: 51.3890 },
    "mashhad,iran": { lat: 36.2605, lon: 59.6168 },
    "isfahan,iran": { lat: 32.6539, lon: 51.6660 },
    
    "baghdad,iraq": { lat: 33.3152, lon: 44.3661 },
    "basra,iraq": { lat: 30.5088, lon: 47.7804 },
    "mosul,iraq": { lat: 36.3350, lon: 43.1189 },
    
    "beirut,lebanon": { lat: 33.8938, lon: 35.5018 },
    "tripoli,lebanon": { lat: 34.4367, lon: 35.8369 },
    "sidon,lebanon": { lat: 33.5633, lon: 35.3689 },
    
    "amman,jordan": { lat: 31.9454, lon: 35.9284 },
    "zarqa,jordan": { lat: 32.0727, lon: 36.0888 },
    "irbid,jordan": { lat: 32.5556, lon: 35.8500 },
    
    "damascus,syria": { lat: 33.5138, lon: 36.2765 },
    "aleppo,syria": { lat: 36.2021, lon: 37.1343 },
    "homs,syria": { lat: 34.7394, lon: 36.7167 },
    
    // Major African cities
    "cairo,egypt": { lat: 30.0444, lon: 31.2357 },
    "alexandria,egypt": { lat: 31.2001, lon: 29.9187 },
    "giza,egypt": { lat: 30.0131, lon: 31.2089 },
    
    "lagos,nigeria": { lat: 6.5244, lon: 3.3792 },
    "abuja,nigeria": { lat: 9.0765, lon: 7.3986 },
    "kano,nigeria": { lat: 12.0022, lon: 8.5920 },
    
    "cape town,south africa": { lat: -33.9249, lon: 18.4241 },
    "johannesburg,south africa": { lat: -26.2041, lon: 28.0473 },
    "durban,south africa": { lat: -29.8587, lon: 31.0218 },
    
    "casablanca,morocco": { lat: 33.5731, lon: -7.5898 },
    "rabat,morocco": { lat: 33.9716, lon: -6.8498 },
    "marrakech,morocco": { lat: 31.6295, lon: -7.9811 },
    
    "nairobi,kenya": { lat: -1.2921, lon: 36.8219 },
    "mombasa,kenya": { lat: -4.0435, lon: 39.6682 },
    "kisumu,kenya": { lat: -0.0917, lon: 34.7680 },
    
    "addis ababa,ethiopia": { lat: 9.1450, lon: 40.4897 },
    "dire dawa,ethiopia": { lat: 9.5931, lon: 41.8661 },
    "mekelle,ethiopia": { lat: 13.4967, lon: 39.4753 },
    
    // Oceania
    "auckland,new zealand": { lat: -36.8485, lon: 174.7633 },
    "wellington,new zealand": { lat: -41.2865, lon: 174.7762 },
    "christchurch,new zealand": { lat: -43.5321, lon: 172.6362 },
    
    "suva,fiji": { lat: -18.1248, lon: 178.4501 },
    "nadi,fiji": { lat: -17.7765, lon: 177.4162 },
    "lautoka,fiji": { lat: -17.6100, lon: 177.4504 },
    
    // Africa (general)
    "cairo,africa": { lat: 30.0444, lon: 31.2357 },
    "lagos,africa": { lat: 6.5244, lon: 3.3792 },
    "johannesburg,africa": { lat: -26.2041, lon: 28.0473 },
    
    // Middle East (general)
    "dubai,middle east": { lat: 25.2048, lon: 55.2708 },
    "riyadh,middle east": { lat: 24.7136, lon: 46.6753 },
    "tehran,middle east": { lat: 35.6892, lon: 51.3890 },
    
    // Additional Asian cities
    "taipei,taiwan": { lat: 25.0330, lon: 121.5654 },
    "kaohsiung,taiwan": { lat: 22.6273, lon: 120.3014 },
    "taichung,taiwan": { lat: 24.1477, lon: 120.6736 },
    
    "taipei,republic of china": { lat: 25.0330, lon: 121.5654 },
    "kaohsiung,republic of china": { lat: 22.6273, lon: 120.3014 },
    "taichung,republic of china": { lat: 24.1477, lon: 120.6736 },
    
    "taipei,formosa": { lat: 25.0330, lon: 121.5654 },
    "kaohsiung,formosa": { lat: 22.6273, lon: 120.3014 },
    "taichung,formosa": { lat: 24.1477, lon: 120.6736 },
    
    "vientiane,laos": { lat: 17.9757, lon: 102.6331 },
    "luang prabang,laos": { lat: 19.8845, lon: 102.1348 },
    "savannakhet,laos": { lat: 16.5569, lon: 104.7573 },
    
    "vientiane,lao": { lat: 17.9757, lon: 102.6331 },
    "luang prabang,lao": { lat: 19.8845, lon: 102.1348 },
    "savannakhet,lao": { lat: 16.5569, lon: 104.7573 },
    
    "phnom penh,kampuchea": { lat: 11.5564, lon: 104.9282 },
    "siem reap,kampuchea": { lat: 13.3671, lon: 103.8448 },
    "battambang,kampuchea": { lat: 13.0957, lon: 103.2028 },
    
    "phnom penh,khmer republic": { lat: 11.5564, lon: 104.9282 },
    "siem reap,khmer republic": { lat: 13.3671, lon: 103.8448 },
    "battambang,khmer republic": { lat: 13.0957, lon: 103.2028 },
    
    "yangon,burma": { lat: 16.8661, lon: 96.1951 },
    "mandalay,burma": { lat: 21.9588, lon: 96.0891 },
    "naypyidaw,burma": { lat: 19.7633, lon: 96.1078 },
    
    "colombo,ceylon": { lat: 6.9271, lon: 79.8612 },
    "kandy,ceylon": { lat: 7.2906, lon: 80.6337 },
    "galle,ceylon": { lat: 6.0535, lon: 80.2210 },
    
    "bangkok,siam": { lat: 13.7563, lon: 100.5018 },
    "phuket,siam": { lat: 7.8804, lon: 98.3923 },
    "chiang mai,siam": { lat: 18.7883, lon: 98.9853 },
    
    "tehran,persia": { lat: 35.6892, lon: 51.3890 },
    "mashhad,persia": { lat: 36.2605, lon: 59.6168 },
    "isfahan,persia": { lat: 32.6539, lon: 51.6660 },
    
    // North Korea
    "pyongyang,north korea": { lat: 39.0392, lon: 125.7625 },
    "hamhung,north korea": { lat: 39.9183, lon: 127.5358 },
    "chongjin,north korea": { lat: 41.7956, lon: 129.7756 },
    
    "pyongyang,dprk": { lat: 39.0392, lon: 125.7625 },
    "hamhung,dprk": { lat: 39.9183, lon: 127.5358 },
    "chongjin,dprk": { lat: 41.7956, lon: 129.7756 },
    
    "pyongyang,democratic people's republic of korea": { lat: 39.0392, lon: 125.7625 },
    "hamhung,democratic people's republic of korea": { lat: 39.9183, lon: 127.5358 },
    "chongjin,democratic people's republic of korea": { lat: 41.7956, lon: 129.7756 },
    
    // Country aliases
    "seoul,korea": { lat: 37.5665, lon: 126.9780 },
    "busan,korea": { lat: 35.1796, lon: 129.0756 },
    "incheon,korea": { lat: 37.4563, lon: 126.7052 },
    
    "seoul,republic of korea": { lat: 37.5665, lon: 126.9780 },
    "busan,republic of korea": { lat: 35.1796, lon: 129.0756 },
    "incheon,republic of korea": { lat: 37.4563, lon: 126.7052 },
    
    "new york,america": { lat: 40.7128, lon: -74.0060 },
    "los angeles,america": { lat: 34.0522, lon: -118.2437 },
    "chicago,america": { lat: 41.8781, lon: -87.6298 },
    
    "london,britain": { lat: 51.5074, lon: -0.1278 },
    "manchester,britain": { lat: 53.4808, lon: -2.2426 },
    "birmingham,britain": { lat: 52.4862, lon: -1.8904 },
    
    "london,england": { lat: 51.5074, lon: -0.1278 },
    "manchester,england": { lat: 53.4808, lon: -2.2426 },
    "birmingham,england": { lat: 52.4862, lon: -1.8904 },
    
    "amsterdam,holland": { lat: 52.3676, lon: 4.9041 },
    "rotterdam,holland": { lat: 51.9244, lon: 4.4777 },
    "the hague,holland": { lat: 52.0705, lon: 4.3007 },
    
    "dubai,emirates": { lat: 25.2048, lon: 55.2708 },
    "abu dhabi,emirates": { lat: 24.4539, lon: 54.3773 },
    "sharjah,emirates": { lat: 25.3463, lon: 55.4209 },
    
    "kinshasa,congo": { lat: -4.4419, lon: 15.2663 },
    "lubumbashi,congo": { lat: -11.6609, lon: 27.4794 },
    "mbuji-mayi,congo": { lat: -6.1360, lon: 23.5900 },
    
    "kinshasa,zaire": { lat: -4.4419, lon: 15.2663 },
    "lubumbashi,zaire": { lat: -11.6609, lon: 27.4794 },
    "mbuji-mayi,zaire": { lat: -6.1360, lon: 23.5900 },
    
    "moscow,soviet union": { lat: 55.7558, lon: 37.6176 },
    "st. petersburg,soviet union": { lat: 59.9311, lon: 30.3609 },
    "novosibirsk,soviet union": { lat: 55.0084, lon: 82.9357 },
    
    "moscow,ussr": { lat: 55.7558, lon: 37.6176 },
    "st. petersburg,ussr": { lat: 59.9311, lon: 30.3609 },
    "novosibirsk,ussr": { lat: 55.0084, lon: 82.9357 },
    
    // Southeast Asia (general)
    "bangkok,southeast asia": { lat: 13.7563, lon: 100.5018 },
    "singapore,southeast asia": { lat: 1.3521, lon: 103.8198 },
    "jakarta,southeast asia": { lat: -6.2088, lon: 106.8456 },
    
    // South Asia (general)
    "mumbai,south asia": { lat: 19.0760, lon: 72.8777 },
    "delhi,south asia": { lat: 28.7041, lon: 77.1025 },
    "dhaka,south asia": { lat: 23.8103, lon: 90.4125 },
    
    // East Asia (general)
    "beijing,east asia": { lat: 39.9042, lon: 116.4074 },
    "tokyo,east asia": { lat: 35.6762, lon: 139.6503 },
    "seoul,east asia": { lat: 37.5665, lon: 126.9780 },
    
    // Default fallback
    "default": { lat: 25.0, lon: 0.0 }
  };
  
  const key = `${city.toLowerCase()},${country.toLowerCase()}`;
  return cityCoords[key] || cityCoords["default"];
} 