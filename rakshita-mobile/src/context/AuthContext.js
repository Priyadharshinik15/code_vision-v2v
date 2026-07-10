import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { tokenStore } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    let token = null;
    try {
      token = await tokenStore.get();
    } catch (e) {
      // Storage read failed for any reason (unsupported platform, corrupted
      // value, etc.) — treat as "no session" rather than hanging forever.
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/me");
      setUser(res.data.user);
    } catch (e) {
      await tokenStore.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const register = async ({ name, email, phone, password }) => {
    const res = await api.post("/register", { name, email, phone, password });
    await tokenStore.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const login = async ({ email, password }) => {
    const res = await api.post("/login", { email, password });
    await tokenStore.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}