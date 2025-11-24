import { useState, useEffect, useRef } from 'react'
import { Send, Settings, Loader2, Bot } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import Sidebar from './Sidebar'
import MessageBubble from './MessageBubble'
import ModelSettings from './ModelSettings'
import ThemeSettings from './ThemeSettings'
import { chatApi } from '@/lib/api'
import type { Message, ModelConfig } from '@/types'

interface ChatSession {
  id: string
  title: string
  updatedAt: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState('default')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false)
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    provider: 'ollama',
    model: 'llama2',
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadSessions()
    loadChatHistory()
    loadModelConfig()
  }, [currentSessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadSessions = () => {
    const savedSessions = localStorage.getItem('chatSessions')
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    } else {
      setSessions([{ id: 'default', title: 'New Chat', updatedAt: new Date() }])
    }
  }

  const loadModelConfig = () => {
    const saved = localStorage.getItem('modelConfig')
    if (saved) {
      setModelConfig(JSON.parse(saved))
    }
  }

  const saveModelConfig = (config: ModelConfig) => {
    setModelConfig(config)
    localStorage.setItem('modelConfig', JSON.stringify(config))
  }

  const loadChatHistory = async () => {
    try {
      const data = await chatApi.getHistory(currentSessionId)
      setMessages(data.messages)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    // Optimistically add user message
    const tempUserMessage: Message = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      sessionId: currentSessionId,
    }
    setMessages((prev) => [...prev, tempUserMessage])

    // Update session title if it's the first message
    if (messages.length === 0) {
      updateSessionTitle(userMessage.substring(0, 50))
    }

    try {
      const response = await chatApi.sendMessage(
        userMessage,
        currentSessionId,
        modelConfig
      )
      await loadChatHistory()
    } catch (error: any) {
      console.error('Error sending message:', error)
      setMessages((prev) => prev.filter((msg) => msg._id !== tempUserMessage._id))
      
      const errorMessage: Message = {
        _id: `error-${Date.now()}`,
        role: 'assistant',
        content: error.response?.data?.message || 'Failed to get response. Please check your model configuration.',
        timestamp: new Date(),
        sessionId: currentSessionId,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const updateSessionTitle = (title: string) => {
    const updatedSessions = sessions.map((s) =>
      s.id === currentSessionId
        ? { ...s, title, updatedAt: new Date() }
        : s
    )
    setSessions(updatedSessions)
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions))
  }

  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      updatedAt: new Date(),
    }
    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    setCurrentSessionId(newSessionId)
    setMessages([])
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions))
  }

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setMessages([])
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (sessions.length === 1) {
      handleNewChat()
    }
    const updatedSessions = sessions.filter((s) => s.id !== sessionId)
    setSessions(updatedSessions)
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions))
    
    if (sessionId === currentSessionId) {
      const nextSession = updatedSessions[0]?.id || 'default'
      setCurrentSessionId(nextSession)
    }
    
    try {
      await chatApi.clearHistory(sessionId)
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h1 className="text-lg font-semibold">Chat</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                  <p className="text-muted-foreground">
                    Type a message below to begin chatting
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message._id} message={message} />
                ))}
                {loading && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-background">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    adjustTextareaHeight()
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  rows={1}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                size="icon"
                className="h-10 w-10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      <ModelSettings
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        modelConfig={modelConfig}
        onSave={saveModelConfig}
        onOpenThemeSettings={() => {
          setIsSettingsOpen(false)
          setIsThemeSettingsOpen(true)
        }}
      />
      <ThemeSettings
        open={isThemeSettingsOpen}
        onOpenChange={setIsThemeSettingsOpen}
        onOpenModelSettings={() => {
          setIsThemeSettingsOpen(false)
          setIsSettingsOpen(true)
        }}
      />
    </div>
  )
}

