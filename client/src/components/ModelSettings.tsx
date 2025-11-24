import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Label } from './ui/label'
import { Palette } from 'lucide-react'
import type { ModelConfig, ModelProvider } from '@/types'

interface ModelSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelConfig: ModelConfig
  onSave: (config: ModelConfig) => void
  onOpenThemeSettings?: () => void
}

const PROVIDER_MODELS: Record<ModelProvider, string[]> = {
  ollama: ['llama2', 'llama2:13b', 'mistral', 'codellama', 'neural-chat'],
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  google: ['gemini-pro', 'gemini-pro-vision', 'text-bison'],
  custom: [],
}

export default function ModelSettings({
  open,
  onOpenChange,
  modelConfig,
  onSave,
  onOpenThemeSettings,
}: ModelSettingsProps) {
  const [config, setConfig] = useState<ModelConfig>(modelConfig)
  const [customModel, setCustomModel] = useState('')
  const [customApiUrl, setCustomApiUrl] = useState('')

  const handleSave = () => {
    const finalConfig: ModelConfig = {
      ...config,
      model: config.provider === 'custom' ? customModel : config.model,
      apiUrl: config.provider === 'custom' ? customApiUrl : config.apiUrl,
    }
    onSave(finalConfig)
    onOpenChange(false)
  }

  const handleProviderChange = (provider: ModelProvider) => {
    setConfig({
      provider,
      model: PROVIDER_MODELS[provider]?.[0] || '',
      apiKey: provider !== 'ollama' ? config.apiKey : undefined,
      apiUrl: provider === 'custom' ? config.apiUrl : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Model Settings</DialogTitle>
          <DialogDescription>
            Configure your AI model provider and API settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={config.provider}
              onValueChange={(value) => handleProviderChange(value as ModelProvider)}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="google">Google (Gemini)</SelectItem>
                <SelectItem value="custom">Custom API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.provider === 'custom' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="custom-model">Model Name</Label>
                <Input
                  id="custom-model"
                  placeholder="e.g., my-custom-model"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-api-url">API URL</Label>
                <Input
                  id="custom-api-url"
                  placeholder="https://api.example.com/v1/chat/completions"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-api-key">API Key</Label>
                <Input
                  id="custom-api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={config.apiKey || ''}
                  onChange={(e) =>
                    setConfig({ ...config, apiKey: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={config.model}
                  onValueChange={(value) => setConfig({ ...config, model: value })}
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_MODELS[config.provider]?.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {config.provider !== 'ollama' && (
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={config.apiKey || ''}
                    onChange={(e) =>
                      setConfig({ ...config, apiKey: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              )}

              {config.provider === 'ollama' && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    Ollama runs locally. Make sure Ollama is running and the model
                    is installed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between">
          <div>
            {onOpenThemeSettings && (
              <Button
                variant="ghost"
                onClick={() => {
                  onOpenChange(false)
                  onOpenThemeSettings()
                }}
                className="gap-2"
              >
                <Palette className="h-4 w-4" />
                Theme Settings
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

