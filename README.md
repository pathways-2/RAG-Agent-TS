# GoAware - AI Travel Advisory System

A comprehensive **AI-powered travel advisory application** built with Next.js, TypeScript, and the AI SDK. GoAware combines official US government travel advisories with real-time weather data to provide travelers with complete, accurate, and up-to-date information for any destination worldwide.

## 🌟 Key Features

### 🎯 **Travel Advisory Intelligence**
- **Official US Government Data**: Access to comprehensive travel advisories from official sources
- **Travel Advisory Levels**: Clear display of Level 1-4 advisory classifications with color-coded indicators
- **Comprehensive Coverage**: Safety, security, crime, terrorism, health, entry requirements, and regional warnings
- **Smart Content Organization**: Automatically categorized sections for easy reading

### 🌤️ **Real-Time Weather Integration**
- **Global Weather Coverage**: 300+ countries and 1000+ cities with accurate coordinates
- **Open-Meteo API**: Free, reliable weather data with no API key requirements
- **Top Cities Focus**: Weather for the 3 most important cities per country
- **Complete Weather Details**: Temperature, conditions, humidity, and wind speed

### 🤖 **AI Agent Capabilities**
- **Multi-Tool Agent**: Uses AI SDK with intelligent tool calling
- **GPT-4o-mini Model**: Optimized for speed and efficiency
- **Conversation Management**: Smart message history limiting for performance
- **Streaming Responses**: Real-time response generation with visual feedback

### 💻 **Modern User Experience**
- **Dual Interface**: Both RAG chat (`/vectorize`) and AI agent (`/agent`) endpoints
- **Visual Section Display**: Color-coded travel advisory sections with icons
- **Weather Cards**: Beautiful weather display with condition descriptions
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Loading Animations**: Smooth user experience with real-time feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 with App Router and Turbopack
- **Language**: TypeScript 5
- **AI/ML**: OpenAI GPT-4o-mini via AI SDK 4.3.16
- **Vector Database**: Vectorize.io for document retrieval
- **Weather API**: Open-Meteo (free, no API key required)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Validation**: Zod for type-safe schemas

## 📋 Prerequisites

Before setting up this project, you'll need:

1. **Node.js** (v18 or higher)
2. **pnpm**: [Install pnpm](https://pnpm.io/installation)
3. **OpenAI API Key**: [Get one here](https://platform.openai.com/api-keys)
4. **Vectorize.io Account**: [Sign up here](https://vectorize.io)

## 🔧 Installation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   # Create the file (from project root)
   touch .env.local
   ```

   Add the following variables:

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Vectorize.io Configuration
   VECTORIZE_PIPELINE_ACCESS_TOKEN=your_vectorize_access_token_here
   VECTORIZE_ORGANIZATION_ID=your_vectorize_organization_id_here
   VECTORIZE_PIPELINE_ID=your_vectorize_pipeline_id_here
   ```

   **Important**: The `.env.local` file is automatically ignored by git, keeping your API keys secure.

## 🔑 Environment Variables Setup

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Give your key a name (e.g., "goaware-travel-app")
5. Copy the generated key immediately (you won't see it again!)
6. In your `.env.local` file, replace `your_openai_api_key_here` with your actual key:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

### Vectorize.io Configuration

1. Sign up at [Vectorize.io](https://vectorize.io)
2. Create a new organization
3. Navigate to your organization settings
4. Create a new pipeline:
   - Choose "Document Retrieval" as the pipeline type
   - Upload US government travel advisory documents
   - Configure your pipeline settings
   - Save the pipeline
5. Generate an access token:
   - Go to "API Tokens" in your organization settings
   - Create a new token with "Retrieval Access" permissions
   - Copy the token
6. From your Vectorize dashboard, copy these values to your `.env.local`:
   ```env
   VECTORIZE_PIPELINE_ACCESS_TOKEN=eyJhbGciOi... (your full token)
   VECTORIZE_ORGANIZATION_ID=527d9a27-c34a-4d0a-8fde-... (your org ID)
   VECTORIZE_PIPELINE_ID=aip0c318-344a-4721-a9e7-... (your pipeline ID)
   ```

### Verifying Your Setup

After adding all environment variables, your `.env.local` file should look similar to this:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Vectorize.io Configuration
VECTORIZE_PIPELINE_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
VECTORIZE_ORGANIZATION_ID=527d9a27-c34a-4d0a-8fde-1129a57eb5b8
VECTORIZE_PIPELINE_ID=aip0c318-344a-4721-a9e7-5526c96d9b49
```

**Note**: Never commit your `.env.local` file to version control!

## 🚀 Getting Started

1. **Start the development server**

   ```bash
   pnpm dev
   ```

2. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Test the application**
   - Visit the main page to see the welcome screen
   - Go to `/vectorize` to access the RAG chat interface
   - Go to `/agent` to access the **GoAware AI Agent** (recommended)
   - Try asking: "Tell me about travel to Japan" or "What's the travel advisory for Germany?"

## 🏗️ GoAware Architecture

### System Overview
GoAware combines the power of AI SDK tools with real-time data integration to deliver comprehensive travel intelligence.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                🌐 USER INTERFACE                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐    ┌───────────────┐    ┌─────────────────────────────────────┐  │
│  │   🏠 Home     │    │  💬 RAG Chat  │    │        🤖 GoAware Agent            │  │
│  │  page.tsx     │    │  /vectorize   │    │         /agent                      │  │
│  │               │    │               │    │  ┌─────────────────────────────────┐ │  │
│  │ Welcome &     │    │ • Document    │    │  │     🧠 Intelligent Chat        │ │  │
│  │ Navigation    │    │   Sources     │    │  │   agent-chat.tsx                │ │  │
│  │               │    │ • RAG Q&A     │    │  │                                 │ │  │
│  └───────────────┘    │ • Source      │    │  │ • Travel Advisory Levels        │ │  │
│                       │   Display     │    │  │ • Color-Coded Sections          │ │  │
│                       └───────────────┘    │  │ • Real-Time Weather Cards       │ │  │
│                                            │  │ • Smart Content Processing      │ │  │
│                                            │  └─────────────────────────────────┘ │  │
│                                            └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               🔧 AI SDK ORCHESTRATION                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────┐                    ┌─────────────────────────────────────┐ │
│  │   📊 RAG Endpoint   │                    │        🤖 Agent Endpoint            │ │
│  │   /api/chat         │                    │        /api/agent                   │ │
│  │                     │                    │                                     │ │
│  │ • generateText()    │                    │ • streamText() with AI SDK Tools    │ │
│  │ • Single Response   │                    │ • Multi-step Processing             │ │
│  │ • Document Context  │                    │ • GPT-4o-mini Model                 │ │
│  └─────────────────────┘                    │ • Conversation History (2 msgs)     │ │
│                                             │                                     │ │
│                                             │ ┌─────────────────────────────────┐ │ │
│                                             │ │        🛠️ AI SDK TOOLS         │ │ │
│                                             │ ├─────────────────────────────────┤ │ │
│                                             │ │ 🔍 searchTravelAdvisories()     │ │ │
│                                             │ │   • Vectorize.io Integration    │ │ │
│                                             │ │   • US Gov Document Retrieval   │ │ │
│                                             │ │   • Advisory Level Detection    │ │ │
│                                             │ │   • Content Organization        │ │ │
│                                             │ │                                 │ │ │
│                                             │ │ 🌤️ getCountryWeather()          │ │ │
│                                             │ │   • Open-Meteo API Integration  │ │ │
│                                             │ │   • 300+ Countries, 1000+ Cities│ │ │
│                                             │ │   • Real-Time Weather Data      │ │ │
│                                             │ │   • Top 3 Cities per Country    │ │ │
│                                             │ └─────────────────────────────────┘ │ │
│                                             └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
                           │                                      │
                           ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              📚 SERVICE & DATA LAYER                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────────┐ │
│  │  🔍 RetrievalService│    │  🌤️ Weather Service │    │   🛠️ Utilities         │ │
│  │  /lib/retrieval.ts  │    │  /lib/weather.ts     │    │  /lib/utils.ts          │ │
│  │                     │    │                     │    │  /lib/consts.ts         │ │
│  │ • Document Search   │    │ • Open-Meteo API    │    │                         │ │
│  │ • Context Assembly  │    │ • City Coordinates  │    │ • Helper Functions      │ │
│  │ • Source Management │    │ • Weather Mapping   │    │ • Constants             │ │
│  │ • Vectorize.io API  │    │ • Country Aliases   │    │ • Loading Messages      │ │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────────────┘ │
│                                      │                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🌐 EXTERNAL INTEGRATIONS                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────────┐ │
│  │    🤖 OpenAI API    │    │   📊 Vectorize.io   │    │   🌤️ Open-Meteo API    │ │
│  │                     │    │                     │    │                         │ │
│  │ • GPT-4o-mini       │    │ • US Gov Travel     │    │ • Free Weather API      │ │
│  │ • Streaming Text    │    │   Documents         │    │ • No API Key Required   │ │
│  │ • Tool Calling      │    │ • Vector Embeddings │    │ • Global Coverage       │ │
│  │ • Temperature: 0.1  │    │ • Semantic Search   │    │ • Real-Time Data        │ │
│  │ • Max Tokens: 8000  │    │ • Document Retrieval│    │ • WMO Weather Codes     │ │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────────────┘ │
│           ▲                           ▲                           ▲                 │
│           │                           │                           │                 │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────────┐ │
│  │ 🔑 OPENAI_API_KEY   │    │ 🔑 VECTORIZE CONFIG │    │   🆓 NO API KEY        │ │
│  │                     │    │                     │    │                         │ │
│  │ Environment Variable│    │ • ACCESS_TOKEN      │    │ • Open Source           │ │
│  └─────────────────────┘    │ • ORGANIZATION_ID   │    │ • Rate Limit Free       │ │
│                             │ • PIPELINE_ID       │    │ • High Availability     │ │
│                             └─────────────────────┘    └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                🔄 DATA FLOW PATTERNS                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  🎯 TRAVEL ADVISORY FLOW:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ User Query → AI Agent → searchTravelAdvisories() → Vectorize.io →             │   │
│  │ US Gov Docs → Level Detection → Content Organization →                        │   │
│  │ Color-Coded Display (Level 1-4, Safety, Crime, Health, etc.)                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  🌤️ REAL-TIME WEATHER FLOW:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ Country Request → getCountryWeather() → City Mapping (300+ countries) →       │   │
│  │ Open-Meteo API → Real Weather Data → Weather Cards → Visual Display          │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  🧠 AI SDK INTELLIGENT PROCESSING:                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ • streamText() with Tool Calling                                              │   │
│  │ • Travel Advisory Level Highlighting                                          │   │
│  │ • Content Separation (Travel vs Weather)                                      │   │
│  │ • Markdown Cleanup & Formatting                                               │   │
│  │ • Weather Filtering from Travel Content                                       │   │
│  │ • Conversation History Limiting (2 messages)                                  │   │
│  │ • Error Handling & Fallback Responses                                         │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 🎯 Key Architecture Features

- **🤖 AI SDK Integration**: Built on Vercel's AI SDK with intelligent tool calling
- **🎯 Accuracy-First Design**: Preserves exact US government advisory content
- **🌤️ Real-Time Weather**: Open-Meteo API integration with global coverage
- **🛡️ Content Separation**: Smart filtering prevents weather data contamination in advisories
- **📊 Travel Advisory Levels**: Color-coded Level 1-4 classifications with visual indicators
- **📱 Responsive UI**: Clean, modern interface with visual section organization
- **⚡ Performance Optimized**: GPT-4o-mini model with conversation limiting
- **🔒 Secure**: Environment-based API key management
- **🆓 Cost Effective**: Free weather API, no additional service costs

### 🛠️ Main AI SDK Tools Used

#### 1. **`searchTravelAdvisories` Tool**
**Purpose**: Retrieves comprehensive travel advisory information from official US government sources
- **Parameters**: 
  - `country`: The destination to search for
  - `query`: Specific travel information needed (safety, entry requirements, etc.)
- **Functionality**: 
  - Uses `RetrievalService` to search the vectorized travel advisory database
  - Returns detailed government travel advisory content including safety warnings, entry requirements, regional restrictions, and health information
  - Handles travel advisory level detection (Level 1-4 classifications)
  - Provides comprehensive content without truncation

#### 2. **`getCountryWeather` Tool**  
**Purpose**: Provides real-time weather information for the top cities in any country
- **Parameters**:
  - `country`: The country to get weather information for
- **Functionality**:
  - Maps country names to top 3 cities using extensive database (300+ countries, 1000+ cities)
  - Integrates with Open-Meteo API for real-time weather data
  - Returns temperature, weather conditions, humidity, and wind speed
  - Supports country name aliases and variations
  - No API key required, completely free service

**Confirmation**: This project uses the **AI SDK** (specifically the `ai` package v4.3.16), not the Agent SDK. The AI SDK provides the `streamText()` function with tool calling capabilities, which powers the intelligent agent functionality.

## 📁 Project Structure

```
goaware-travel-advisory/
├── app/
│   ├── agent/             # 🤖 GoAware AI Agent Interface
│   │   └── page.tsx       # Agent page with travel advisory UI
│   ├── api/
│   │   ├── agent/         # 🛠️ AI SDK Agent with Tools
│   │   │   └── route.ts   # Streaming agent with travel & weather tools
│   │   └── chat/          # 💬 Traditional RAG Chat API
│   │       └── route.ts   # Single-turn RAG endpoint
│   ├── vectorize/         # 📚 RAG chat interface
│   │   └── page.tsx       # Vectorize chat page
│   ├── globals.css        # 🎨 Global styles with travel theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # 🏠 Home page with navigation
├── components/
│   ├── agent-chat.tsx    # 🤖 GoAware agent chat (client-side)
│   │                     #     • Travel advisory level display
│   │                     #     • Color-coded sections
│   │                     #     • Weather card formatting
│   ├── chat.tsx          # 💬 RAG chat component
│   └── sources-display.tsx # 📄 Document sources display
├── lib/
│   ├── consts.ts         # 📝 Constants and loading messages
│   ├── retrieval.ts      # 🔍 Document retrieval service (Vectorize.io)
│   ├── utils.ts          # 🛠️ Utility functions
│   ├── vectorize.ts      # 📊 Vectorize.io API integration
│   └── weather.ts        # 🌤️ Weather service (Open-Meteo API)
│                         #     • 300+ countries, 1000+ cities
│                         #     • Real-time weather data
│                         #     • Country name aliases
├── types/
│   ├── chat.ts           # 💬 Chat-related types
│   └── vectorize.ts      # 📊 Vectorize API types
└── .env.local           # 🔐 Environment variables
```

## 🔄 How GoAware Works

### 🎯 **Travel Advisory Flow**
1. **User Query**: User asks about a country (e.g., "Tell me about travel to Japan")
2. **AI Agent Processing**: AI SDK agent analyzes the query and determines which tools to use
3. **Document Retrieval**: `searchTravelAdvisories()` tool queries Vectorize.io for official US government travel documents
4. **Weather Integration**: `getCountryWeather()` tool fetches real-time weather for top 3 cities via Open-Meteo API
5. **Content Organization**: AI processes and organizes content, detecting travel advisory levels (1-4)
6. **Visual Display**: Frontend displays color-coded travel advisory sections and weather cards
7. **Smart Filtering**: Weather content is filtered from travel advisories to prevent duplication

### 🌤️ **Weather Integration**
- **Global Coverage**: Supports 300+ countries and territories with 1000+ major cities
- **Real-Time Data**: Open-Meteo API provides current weather conditions, temperature, humidity, and wind
- **Smart Mapping**: Country name aliases handle variations like "USA", "United States", "America"
- **Free Service**: No API key required, no rate limits, completely free weather data

## 🎯 Usage Guide

### 🤖 **GoAware AI Agent (Recommended)**
Navigate to `/agent` for the main GoAware experience:

**Example Queries:**
- "What's the travel advisory for Germany?"
- "Tell me about travel safety in Yemen"
- "I'm planning a trip to Thailand, what should I know?"
- "What's the current situation in Haiti?"

**Features:**
- **Travel Advisory Levels**: See Level 1-4 classifications with color coding
- **Comprehensive Information**: Safety, crime, terrorism, health, entry requirements
- **Real-Time Weather**: Current conditions for major cities
- **Visual Organization**: Clear sections with icons and color coding

### 💬 **RAG Chat Interface**
Navigate to `/vectorize` for document-focused chat:
- Type questions related to travel advisories
- View source documents that informed each response
- Traditional Q&A format with document citations

### 📊 **Document Management**

**For Administrators:**
To add or update travel advisory documents in your Vectorize.io database:
1. Access your Vectorize.io dashboard
2. Upload new US government travel advisory documents
3. Process documents through the pipeline
4. Documents become immediately available to GoAware

**Current Database:**
The system is pre-configured with comprehensive US government travel advisories covering safety, security, health, and entry requirements for countries worldwide.

## 🛠️ Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint

## 🔍 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all required environment variables are set in `.env.local`
   - Check that your OpenAI API key is valid and has sufficient credits
   - Verify Vectorize.io credentials are correct

2. **Travel Advisory Data Issues**
   - Verify your Vectorize.io pipeline contains travel advisory documents
   - Check that your pipeline is active and properly configured
   - Ensure documents are properly processed and indexed

3. **Weather Data Issues**
   - Weather service uses Open-Meteo API (no API key required)
   - If weather fails, check internet connectivity
   - Weather data automatically falls back to mock data if API is unavailable

4. **OpenAI API Rate Limits**
   - GoAware uses GPT-4o-mini for efficiency
   - Monitor your OpenAI usage dashboard
   - Consider upgrading your OpenAI plan if hitting rate limits frequently

### Error Messages

- `Failed to retrieve documents from Vectorize` - Check Vectorize.io configuration and pipeline status
- `Error retrieving travel advisory information` - Usually indicates Vectorize.io connectivity issues
- `Error retrieving weather information` - Open-Meteo API connectivity issue (rare)
- `Rate limit reached for gpt-4o-mini` - OpenAI API rate limit hit, wait or upgrade plan

### Performance Tips

- GoAware limits conversation history to 2 messages for optimal performance
- Each query processes travel advisories and weather data in parallel
- Clear your browser cache if experiencing UI issues
- Use specific country names for best results (e.g., "United States" vs "US")

## 📖 Learn More

### GoAware Resources

- **AI SDK Documentation**: [Vercel AI SDK](https://sdk.vercel.ai) - Core framework powering GoAware's agent
- **Open-Meteo API**: [Open-Meteo Docs](https://open-meteo.com/en/docs) - Free weather API used by GoAware
- **Travel Advisory Sources**: [US State Department](https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html) - Official travel advisory data

### Next.js & Development

- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [TypeScript](https://www.typescriptlang.org/docs) - Type safety

### AI & Vector Databases

- [OpenAI API Documentation](https://platform.openai.com/docs) - AI model provider
- [Vectorize.io Documentation](https://vectorize.io/docs) - Vector database for travel documents

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to Git**: Push your GoAware code to GitHub, GitLab, or Bitbucket
2. **Connect to Vercel**: Import your repository at [vercel.com](https://vercel.com)
3. **Environment Variables**: Add your `.env.local` variables in the Vercel dashboard:
   - `OPENAI_API_KEY`
   - `VECTORIZE_PIPELINE_ACCESS_TOKEN`
   - `VECTORIZE_ORGANIZATION_ID`
   - `VECTORIZE_PIPELINE_ID`
4. **Deploy**: Vercel automatically builds and deploys GoAware
5. **Custom Domain**: Optionally add a custom domain for your travel advisory service

### Other Platforms

GoAware can be deployed on any platform supporting Next.js:
- **Netlify**: Full support for Next.js applications
- **Railway**: Easy deployment with environment variable management
- **DigitalOcean App Platform**: Scalable hosting option
- **AWS Amplify**: Enterprise-grade hosting with CI/CD

## 🌟 Features Roadmap

### Planned Enhancements
- **🗺️ Interactive Maps**: Visual display of travel advisory regions
- **📱 Mobile App**: React Native version for mobile travelers
- **🔔 Alert System**: Email notifications for travel advisory updates
- **🌍 Multi-Language**: Support for multiple languages
- **📊 Analytics**: Travel safety trends and statistics
- **🎯 Personalization**: Customized advisories based on travel preferences

## 🤝 Contributing

We welcome contributions to make GoAware even better!

### How to Contribute
1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Implement your feature or bug fix
4. **Run tests**: `pnpm lint` and test thoroughly
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Submit a pull request**: Describe your changes and their benefits

### Areas for Contribution
- **🌍 Country Coverage**: Expand weather data for more cities
- **🎨 UI/UX**: Improve the user interface and experience
- **📊 Data Sources**: Integrate additional travel information sources
- **🔧 Performance**: Optimize API calls and response times
- **📱 Accessibility**: Enhance accessibility features
- **🧪 Testing**: Add comprehensive test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **US State Department**: For providing comprehensive travel advisory data
- **Open-Meteo**: For free, reliable weather API service
- **Vercel**: For the excellent AI SDK framework
- **Vectorize.io**: For powerful vector database capabilities
- **OpenAI**: For GPT-4o-mini model powering the intelligence

---

**Built with ❤️ for safer travels worldwide**
