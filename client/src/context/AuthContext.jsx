import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, apiPost } from "../api";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("banco_token") || null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("banco_user") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const data = await apiFetch("/auth/me");
      if (data?.user) {
        localStorage.setItem("banco_user", JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem("banco_token");
    localStorage.removeItem("banco_user");
    setToken(null);
    setUser(null);
  }, [setToken, setUser]);

  useEffect(() => {
    if (token && !user) {
      refreshProfile().catch(() => {
        logout();
      });
    }
  }, [refreshProfile, token, user, logout]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await apiPost("/auth/login", credentials);

      localStorage.setItem("banco_token", data.token);
      localStorage.setItem("banco_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, [setToken, setUser]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, refreshProfile }),
    [user, token, loading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
