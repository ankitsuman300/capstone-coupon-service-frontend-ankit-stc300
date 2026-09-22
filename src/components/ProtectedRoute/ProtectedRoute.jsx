import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { SitemapRoute } from '@/utils/routes';

// One component handles both jobs the Brief calls out separately:
// "redirect to login if unauthenticated; role-gate admin routes". Passing
// no `role` prop means "just check authentication"; passing `role="admin"`
// additionally checks the decoded role from the JWT (see utils/jwt.js —
// UI-only, the backend's requireRole middleware is the real gate).
export const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, checking, user } = useAuth();
  const location = useLocation();

  // Don't redirect while we're still trying a silent session restore on
  // first load — that would bounce an already-logged-in user to /login
  // for a flash before the refresh call resolves.
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
