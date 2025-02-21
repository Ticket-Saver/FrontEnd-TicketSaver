import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import ProtectedPage from '../protectedPage'
import HomeUnlogin from '../pages/HomeUnlogin'
import LayoutHeaderFooter from '../layouts/LayoutHeaderFooter'
import LayoutHeader from '../layouts/LayoutHeader'
import Dashboard from '../pages/Dashboard'
import MyProfile from '../pages/MyProfile'
import MyTickets from '../pages/MyTickets'
import MySettings from '../pages/MySettings'
import YouNeedHelp from '../pages/YouNeedHelp'
import Web3 from '../pages/Web3'
import UpcomingEvent from '../pages/dashboardTabs/UpcomigeEvents'
import PastEvent from '../pages/dashboardTabs/PastEvent'
import Collectibles from '../pages/dashboardTabs/Collectibles'
import ReturnPage from '../pages/ReturnPage'
import CheckoutPage from '../pages/checkout'
import EventSalePage from '../pages/EventSalePage'
import SalePage from '../pages/SalePage'
import EventPage from '../pages/EventPage'
import Contact from '../pages/Contact'
import AboutPage from '../pages/AboutPage'
import TermsConditionPage from '../pages/Terms&conditionsPage'
import PrivayPolicyPage from '../pages/PrivayPolicyPage'
import PCICompliancePage from '../pages/PciCompliancePage'
import FaqsPage from '../pages/FaqsPage'
import SuccessCheckout from '../components/SuccessCheckout'

const ProtectedRoute = ({ element }: { element: ReactNode }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  if (!isAuthenticated) {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    })
    return null
  }
  return isAuthenticated ? element : <Navigate to="/" />
}

export const AppRouter = () => (
  <Router>
    <Routes>
      <Route
        path="/"
        element={
          <LayoutHeaderFooter>
            <HomeUnlogin />
          </LayoutHeaderFooter>
        }
      />
      <Route path="/success" element={<SuccessCheckout />} />
      <Route path="/checkout" element={<ProtectedRoute element={<CheckoutPage />} />} />

      <Route path="return" element={<ReturnPage />} />

      <Route path="/protected" element={<ProtectedRoute element={<ProtectedPage />} />} />

      <Route
        path="/footer/contact"
        element={
          <LayoutHeaderFooter>
            <Contact />
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/footer/terms&conditions"
        element={
          <LayoutHeaderFooter>
            <TermsConditionPage />
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/footer/PrivayPolicy"
        element={
          <LayoutHeaderFooter>
            <PrivayPolicyPage />
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/footer/PCICompliance"
        element={
          <LayoutHeaderFooter>
            <PCICompliancePage />
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/faqs"
        element={
          <LayoutHeaderFooter>
            <FaqsPage />
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/about"
        element={
          <LayoutHeaderFooter>
            <AboutPage />
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/events"
        element={
          <LayoutHeaderFooter>
            <EventPage />
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/event/:name/:venue/:date/:label/:delete?"
        element={
          <LayoutHeaderFooter>
            <EventSalePage />{' '}
          </LayoutHeaderFooter>
        }
      />

      <Route
        path="/sale/:name/:venue/:location/:date/:label/:delete?"
        element={
          <ProtectedRoute
            element={
              <LayoutHeaderFooter>
                <SalePage />{' '}
              </LayoutHeaderFooter>
            }
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            element={
              <LayoutHeader>
                <Dashboard />
              </LayoutHeader>
            }
          />
        }
      >
        <Route path="profile" element={<MyProfile />} />
        <Route path="tickets" element={<MyTickets />}>
          <Route path="upcomingevent" element={<UpcomingEvent />} />
          <Route path="pastevent" element={<PastEvent />} />
          <Route path="collectibles" element={<Collectibles />} />
        </Route>
        <Route path="settings" element={<MySettings />} />
        <Route path="help" element={<YouNeedHelp />} />
        <Route path="web3" element={<Web3 />} />
      </Route>
    </Routes>
  </Router>
)
