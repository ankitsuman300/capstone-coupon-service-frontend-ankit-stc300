import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser as loginUserRequest, logoutUser as logoutUserRequest } from '@/services/auth';
import { setAccessToken, api } from '@/services/api';
import { decodeJwtPayload } from '@/utils/jwt';

// Global client state (State & Assets doc: "theme, current user, feature
// flags... owned by React Context"). The current user and their role are
// exactly that kind of state — read by many unrelated components
// (AppShell, ProtectedRoute, every admin page) that don't need to
// coordinate with each other, so Context is the right tool rather than
// prop-drilling or reaching for Redux.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // `checking` covers the brief window on page load/refresh where we don't
  // yet know if the user has a valid session (refresh cookie) or not —
  // without it, ProtectedRoute would flash a redirect-to-login before the
  // silent refresh below has a chance to run.
  const [checking, setChecking] = useState(true);

  // On first mount (a hard refresh, or opening the app in a new tab), we
  // have no access token in memory — only whatever httpOnly cookies the
  // browser already holds. Try the refresh endpoint once; if it succeeds,
  // treat it as "still logged in". The refresh response only returns a new
  // accessToken (not a full user object), so we decode the role straight
  // out of the token itself — see utils/jwt.js for why that's safe to do
  // client-side (UI-only, never a security boundary).
  useEffect(() => {
    const tryRestoreSession = async () => {
      try {
        const { data } = await api.put('/users/update-refresh-access');
        const accessToken = data?.data?.accessToken;
        setAccessToken(accessToken);
        const claims = decodeJwtPayload(accessToken);
        setUser(claims ? { id: claims.id, name: claims.name, email: claims.email, role: claims.role } : null);
      } catch {
        setAccessToken(null);
      } finally {
        setChecking(false);
      }
    };
    tryRestoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    const { accessToken, user: loggedInUser } = await loginUserRequest(credentials);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUserRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// The context+hook pair lives in one file by convention (Component
// Conventions doc); this only affects Fast Refresh granularity, not
// correctness.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
