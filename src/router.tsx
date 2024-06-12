import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import ProtectedPage from './protectedPage';
import HomeUnlogin from './pages/HomeUnlogin';
import LayoutHeaderFooter from './layouts/LayoutHeaderFooter';

const ProtectedRoute = ({ element }: { element: ReactNode }) => {
  const { isAuthenticated } = useAuth0();
  return isAuthenticated ? element : <Navigate to="/" />;
};

export const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LayoutHeaderFooter><HomeUnlogin /></LayoutHeaderFooter>} />
      <Route path="/protected" element={
        <ProtectedRoute element={<ProtectedPage />} />
      } />
    </Routes>
  </Router>
);