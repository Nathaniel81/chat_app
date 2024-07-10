import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { ConversationProvider } from './context/ConversationContext.tsx'
import { UserProvider } from './context/UserContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
      <UserProvider>
        <ConversationProvider>
          <App />
        </ConversationProvider>
      </UserProvider>
    </ThemeProvider>
)
