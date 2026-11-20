import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { setUnauthorizedHandler, tokenStore } from '../api/client';

const AuthContext = createContext(null);

/**
 * Holds the logged-in user for the whole app.
 * On page load, if a token is saved, we ask the API who it belongs to.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restore the session after a refresh.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi.profile()
      .then(setUser)
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, [clearSession]);

  // An expired token anywhere in the app logs the user out.
  useEffect(() => setUnauthorizedHandler(clearSession), [clearSession]);

  const login = useCallback(async (username, password) => {
    const { token, user: loggedIn } = await authApi.login(username, password);
    tokenStore.set(token);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const signup = useCallback((data) => authApi.signup(data), []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* token may already be invalid */ }
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, isAuthenticated: Boolean(user) }),
    [user, loading, login, signup, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
