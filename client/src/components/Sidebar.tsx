import { useState } from 'react'
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface ChatSession {
  id: string
  title: string
  updatedAt: Date
}

interface SidebarProps {
  sessions: ChatSession[]
  currentSessionId: string
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <>
      <div className="flex h-full w-64 flex-col border-r bg-background">
        <div className="p-3">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
              Recent Chats
            </div>
            {sessions.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                No chats yet. Start a new conversation!
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent ${
                      currentSessionId === session.id ? 'bg-accent' : ''
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="flex-1 truncate text-left"
                    >
                      <div className="truncate">{session.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(session.updatedAt)}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your model and API settings
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Settings will be available in the main chat interface.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

