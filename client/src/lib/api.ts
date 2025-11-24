import axios from 'axios'
import type { Message, ModelConfig } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const chatApi = {
  sendMessage: async (message: string, sessionId: string, modelConfig?: ModelConfig) => {
    const response = await api.post<{
      response: string
      sessionId: string
      timestamp: string
    }>('/chat/message', {
      message,
      sessionId,
      modelConfig,
    })
    return response.data
  },

  getHistory: async (sessionId: string, limit = 50) => {
    const response = await api.get<{
      messages: Message[]
      sessionId: string
    }>('/chat/history', {
      params: { sessionId, limit },
    })
    return response.data
  },

  clearHistory: async (sessionId: string) => {
    const response = await api.delete<{
      message: string
      sessionId: string
    }>('/chat/history', {
      data: { sessionId },
    })
    return response.data
  },
}

export default api

