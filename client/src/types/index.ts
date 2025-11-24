export interface Message {
  _id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string | Date
  sessionId: string
}

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export type ModelProvider = 'ollama' | 'openai' | 'anthropic' | 'google' | 'custom'

export interface ModelConfig {
  provider: ModelProvider
  model: string
  apiKey?: string
  apiUrl?: string
}

