import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { HashRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import DataLoader from './components/DataLoader'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ErrorBoundary level="top">
          <DataLoader>
            {({ familyData, historyData, hitlistData }) => (
              <App
                familyData={familyData}
                historyData={historyData}
                hitlistData={hitlistData}
              />
            )}
          </DataLoader>
        </ErrorBoundary>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
