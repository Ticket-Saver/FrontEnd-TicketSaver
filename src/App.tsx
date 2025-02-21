import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import FeaturedEvents from './components/FeaturedEvents'
import Layout from './components/Layout'
import EventDetails from './components/EventDetails'
import Checkout from './components/Checkout'
import Success from './components/Success'
import Cancel from './components/Cancel'

const queryClient = new QueryClient()

function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<FeaturedEvents />} />
              <Route
                path="/event/:eventName/:eventId/:eventDate/:eventLabel/:eventDeletedAt"
                element={<EventDetails />}
              />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </Auth0Provider>
  )
}

export default App
