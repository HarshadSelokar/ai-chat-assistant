# Chat Interface with RAG

A full-stack chat application that uses React (TypeScript), Node.js, Express, MongoDB, and multiple AI providers to provide context-aware responses using Retrieval-Augmented Generation (RAG).

## Features

- **Modern React Frontend**: Beautiful ChatGPT-like UI built with TypeScript, shadcn/ui, and Tailwind CSS
- **Multiple AI Providers**: Support for Ollama, OpenAI, Anthropic (Claude), Google (Gemini), and custom APIs
- **Model Configuration**: Easy model selection and API key management through settings
- **Node.js Backend**: Express server that handles chat requests and integrates with multiple AI providers
- **MongoDB Storage**: Stores complete chat history for future retrieval
- **RAG Implementation**: Retrieves relevant past conversations to provide context-aware responses
- **Session Management**: Multiple chat sessions with sidebar navigation
- **Dark Mode Support**: Built-in dark mode styling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- For Ollama: Ollama installed and running locally (optional)
- For other providers: API keys from respective providers (OpenAI, Anthropic, Google)

## Installation

1. Clone the repository and navigate to the project directory

2. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

3. Set up environment variables:

Create a `server/.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-interface
OLLAMA_API_URL=http://localhost:11434/api/generate
```

Create a `client/.env` file (optional, defaults to localhost:5000):
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start MongoDB
Make sure MongoDB is running on your system.

### Start Ollama (Optional - if using Ollama)
If you want to use Ollama, make sure it's running and you have a model installed:
```bash
ollama serve
# In another terminal
ollama pull llama2
```

**Note**: You can also use OpenAI, Anthropic, Google, or custom APIs. Configure these in the Settings dialog within the app.

### Start the Application

From the root directory, run:
```bash
npm run dev
```

This will start both the backend server and the React frontend concurrently.

Or start them separately:

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000`
The backend API will be available at `http://localhost:5000`

## Model Configuration

Click the Settings icon in the top-right corner to configure your AI model:

1. **Select Provider**: Choose from Ollama, OpenAI, Anthropic, Google, or Custom API
2. **Select Model**: Choose the specific model for your provider
3. **Enter API Key**: For cloud providers (OpenAI, Anthropic, Google), enter your API key
4. **Custom API**: For custom APIs, provide the model name, API URL, and optional API key

Your settings are saved locally and never sent to our servers.

## API Endpoints

### POST /api/chat/message
Send a message and get a response.

**Request Body:**
```json
{
  "message": "Your message here",
  "sessionId": "default"
}
```

**Response:**
```json
{
  "response": "Bot response",
  "sessionId": "default",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/chat/history
Get chat history for a session.

**Query Parameters:**
- `sessionId` (optional, default: "default")
- `limit` (optional, default: 50)

### DELETE /api/chat/history
Clear chat history for a session.

**Request Body:**
```json
{
  "sessionId": "default"
}
```

## How RAG Works

1. When a user sends a message, the system:
   - Saves the user message to MongoDB
   - Searches for relevant past conversations using text search
   - Retrieves the top 5 most relevant conversation pairs
   - Builds a context string from these conversations
   - Sends the context along with the current message to Ollama
   - Saves the generated response to MongoDB

2. The RAG service uses MongoDB's text search capabilities to find semantically similar messages, providing context-aware responses.

## Project Structure

```
chat-interface/
├── client/                 # React + TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ModelSettings.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   └── chat.js
│   ├── services/
│   │   ├── modelService.js  # Multi-provider support
│   │   └── ragService.js
│   ├── index.js
│   └── package.json
├── package.json
└── README.md
```

## Troubleshooting

- **Ollama connection errors**: Make sure Ollama is running and the API URL in `.env` is correct
- **MongoDB connection errors**: Verify MongoDB is running and the connection string is correct
- **CORS errors**: The backend is configured to allow CORS from the frontend

## License

ISC

