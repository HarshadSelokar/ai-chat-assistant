import { useTheme } from '@/contexts/ThemeContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Moon, Sun, Palette, Settings } from 'lucide-react'
import { Button } from './ui/button'

interface ThemeSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenModelSettings?: () => void
}

const COLOR_PALETTES = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
] as const

export default function ThemeSettings({ open, onOpenChange, onOpenModelSettings }: ThemeSettingsProps) {
  const { theme, colorPalette, setTheme, setColorPalette } = useTheme()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </DialogTitle>
          <DialogDescription>
            Customize the appearance of your chat interface
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Theme Mode */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Theme Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setTheme('light')}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setTheme('dark')}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Color Palette</Label>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.value}
                  onClick={() => setColorPalette(palette.value as any)}
                  className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                    colorPalette === palette.value
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full ${palette.color}`} />
                  <span className="text-sm font-medium">{palette.label}</span>
                  {colorPalette === palette.value && (
                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        {onOpenModelSettings && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                onOpenChange(false)
                onOpenModelSettings()
              }}
              className="w-full gap-2"
            >
              <Settings className="h-4 w-4" />
              Model Settings
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

