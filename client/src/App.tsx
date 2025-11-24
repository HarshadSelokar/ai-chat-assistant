import ChatInterface from './components/ChatInterface'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  )
}

export default App

