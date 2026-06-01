import { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL = "http://localhost:5000/api";

// Axios interceptor — auto-attach token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Axios interceptor — auto-logout on 401
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // true until localStorage is checked
  const [error, setError] = useState(null);

  // Restore session on mount + verify token with server
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      // Fix: token is the source of truth on refresh; saved user is only a fast preview.
      if (token) {
        try {
          if (savedUser) setUser(JSON.parse(savedUser));
          const res = await axios.get(`${API_BASE_URL}/auth/me`);
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch {
          // Token invalid or expired — clean up silently
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setInitializing(false);
    };
    restoreSession();
  }, []);

  const register = useCallback(async (name, email, password, mobile) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/register`, {
        name, email, password, mobile,
      });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        email, password,
      });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  // Allow updating local user state after profile edits
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, initializing, error, register, login, logout, updateUser, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
