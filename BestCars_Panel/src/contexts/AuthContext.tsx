import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStoredToken, login as apiLogin, setStoredToken } from "../services/api";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  apiMode: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const apiMode = !!import.meta.env.VITE_API_URL;

  useEffect(() => {
    setToken(getStoredToken());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleExpired = () => setToken(null);
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token: t } = await apiLogin(username, password);
    setStoredToken(t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
        apiMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
