import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import {
  clearSession,
  getStoredUser,
  getToken,
  storeSession,
} from '../services/api';

const AuthContext = createContext(null);

/**
 * Manages user/token state. Handles page refresh by revalidating
 * the stored token against GET /api/auth/me.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // Revalidate stored token on mount (page refresh)
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) {
          clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // React to 401s fired by the axios interceptor
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    storeSession(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authService.register(payload);
    storeSession(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem('gym_user', JSON.stringify(nextUser));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAdmin: user?.role === 'admin',
    }),
    [user, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
