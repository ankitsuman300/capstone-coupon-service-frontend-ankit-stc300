import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { SitemapRoute } from '@/utils/routes';

export const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, checking, user } = useAuth();
  const location = useLocation();

  if (checking) return <LoadingState label="Checking your session…" />;

  if (!isAuthenticated) {
    return <Navigate to={SitemapRoute.LOGIN} state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Authenticated, but wrong role — redirect away rather than show a
    // blank/broken admin page to a customer.
    return <Navigate to={SitemapRoute.REDEEM} replace />;
  }
  return <Outlet />;
};
