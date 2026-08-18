import { createContext, useContext, useEffect, useState } from "react";

import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  saveAuthSession,
} from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  /*
   * Restore session saat aplikasi
   * pertama kali dibuka.
   */
  useEffect(() => {
    const storedToken = getAccessToken();

    const storedUser = getStoredUser();

    if (storedToken && storedUser && storedUser.role === "mentor") {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      clearAuthSession();
    }

    setLoading(false);
  }, []);

  /*
   * Tangani session yang invalid
   * dari API client.
   */
  useEffect(() => {
    function handleUnauthorized() {
      clearAuthSession();

      setToken(null);
      setUser(null);
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  function loginSession(accessToken, userData) {
    /*
     * Safety check tambahan.
     */
    if (userData?.role !== "mentor") {
      throw new Error("Hanya akun mentor yang dapat login.");
    }

    saveAuthSession({
      access_token: accessToken,
      user: userData,
    });

    setToken(accessToken);
    setUser(userData);
  }

  function logout() {
    clearAuthSession();

    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,

    isAuthenticated: Boolean(token && user),

    loginSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}
