import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { HashRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ErrorBoundary level="top">
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
