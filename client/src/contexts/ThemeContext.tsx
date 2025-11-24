import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark'
export type ColorPalette = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink'

interface ThemeContextType {
  theme: ThemeMode
  colorPalette: ColorPalette
  setTheme: (theme: ThemeMode) => void
  setColorPalette: (palette: ColorPalette) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  
  const [colorPalette, setColorPaletteState] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('colorPalette')
    if (saved && ['blue', 'green', 'purple', 'orange', 'red', 'pink'].includes(saved)) {
      return saved as ColorPalette
    }
    return 'blue'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.setAttribute('data-color-palette', colorPalette)
    localStorage.setItem('theme', theme)
    localStorage.setItem('colorPalette', colorPalette)
  }, [theme, colorPalette])

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
  }

  const setColorPalette = (newPalette: ColorPalette) => {
    setColorPaletteState(newPalette)
  }

  return (
    <ThemeContext.Provider value={{ theme, colorPalette, setTheme, setColorPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

