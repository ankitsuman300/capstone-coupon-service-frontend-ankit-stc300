import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser as loginUserRequest, logoutUser as logoutUserRequest } from '@/services/auth';
import { setAccessToken, api } from '@/services/api';
import { decodeJwtPayload } from '@/utils/jwt';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
