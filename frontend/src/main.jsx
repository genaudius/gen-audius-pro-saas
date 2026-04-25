import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './v3.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { DatabaseProvider } from './context/DatabaseContext.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import { ApiKeysProvider } from './context/ApiKeysContext.jsx'
import { ProviderProvider } from './context/ProviderContext.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DatabaseProvider>
      <WalletProvider>
        <ApiKeysProvider>
          <ProviderProvider>
            <LanguageProvider>
              <PlayerProvider>
                <App />
              </PlayerProvider>
            </LanguageProvider>
          </ProviderProvider>
        </ApiKeysProvider>
      </WalletProvider>
    </DatabaseProvider>
  </StrictMode>,
)
