import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { AppRouter } from './router/Router'
import './index.css'
import 'unfonts.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

console.log('Auth0 Domain:', domain)
console.log('Auth0 Client ID:', clientId)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <AppRouter />
    </Auth0Provider>
  </React.StrictMode>
)
