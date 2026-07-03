/* eslint-disable preserve-caught-error */
import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

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
          const res = await axios.get("/api/auth/me");
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
      const { data } = await axios.post("/api/auth/register", {
        name, email, password, mobile,
      });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      // eslint-disable-next-line preserve-caught-error
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/auth/login", {
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

  // OTP LOGIN — step 1: request a code be sent via email or mobile (SMS)
  const sendOtp = useCallback(async (identifier, channel) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/auth/send-otp", { identifier, channel });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send OTP";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // OTP LOGIN — step 2: verify the code and log in
  const verifyOtp = useCallback(async (identifier, channel, otp) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/auth/verify-otp", { identifier, channel, otp });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send reset email";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/auth/reset-password", {
        token, email, password,
      });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password";
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
      value={{
        user, loading, initializing, error,
        register, login, logout, updateUser, clearError,
        sendOtp, verifyOtp, forgotPassword, resetPassword,
      }}
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
