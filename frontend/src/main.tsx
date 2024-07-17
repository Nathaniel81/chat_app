import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { UserProvider } from './context/UserContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
      <UserProvider>
          <Toaster />
          <App />
      </UserProvider>
    </ThemeProvider>
)
