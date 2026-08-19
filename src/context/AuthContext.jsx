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

  /*
   * true selama session belum selesai
   * dipulihkan dari storage.
   */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function restoreSession() {
      try {
        const storedToken = getAccessToken();
        const storedUser = getStoredUser();

        if (storedToken && storedUser && storedUser.role === "mentor") {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          clearAuthSession();

          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to restore auth session:", error);

        clearAuthSession();

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  /*
   * Tangani session invalid dari API client.
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

  function updateUser(userData) {
    const nextUser = { ...user, ...userData };

    saveAuthSession({
      access_token: token,
      user: nextUser,
    });

    setUser(nextUser);
  }

  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    loginSession,
    updateUser,
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
