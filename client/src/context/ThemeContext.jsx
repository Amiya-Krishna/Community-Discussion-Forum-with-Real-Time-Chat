import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext();

// CSS variables injected globally so all components can use them
const applyThemeVars = (isDark) => {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    root.style.setProperty("--bg-primary",      "#050508");
    root.style.setProperty("--bg-surface",      "rgba(255,255,255,0.035)");
    root.style.setProperty("--bg-elevated",     "rgba(255,255,255,0.06)");
    root.style.setProperty("--border-subtle",   "rgba(255,255,255,0.07)");
    root.style.setProperty("--border-accent",   "rgba(108,71,255,0.3)");
    root.style.setProperty("--text-primary",    "#ffffff");
    root.style.setProperty("--text-secondary",  "rgba(255,255,255,0.55)");
    root.style.setProperty("--text-muted",      "rgba(255,255,255,0.3)");
    root.style.setProperty("--accent",          "#6c47ff");
    root.style.setProperty("--accent-soft",     "rgba(108,71,255,0.15)");
    root.style.setProperty("--accent-text",     "#c4b5fd");
    root.style.setProperty("--shadow-card",     "0 20px 60px rgba(0,0,0,0.4)");
  } else {
    root.classList.remove("dark");
    root.style.setProperty("--bg-primary",      "#f8f7ff");
    root.style.setProperty("--bg-surface",      "rgba(255,255,255,0.92)");
    root.style.setProperty("--bg-elevated",     "rgba(255,255,255,0.98)");
    root.style.setProperty("--border-subtle",   "rgba(108,71,255,0.1)");
    root.style.setProperty("--border-accent",   "rgba(108,71,255,0.35)");
    root.style.setProperty("--text-primary",    "#0f0a1e");
    root.style.setProperty("--text-secondary",  "rgba(15,10,30,0.65)");
    root.style.setProperty("--text-muted",      "rgba(15,10,30,0.35)");
    root.style.setProperty("--accent",          "#6c47ff");
    root.style.setProperty("--accent-soft",     "rgba(108,71,255,0.08)");
    root.style.setProperty("--accent-text",     "#6c47ff");
    root.style.setProperty("--shadow-card",     "0 10px 40px rgba(108,71,255,0.1)");
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    applyThemeVars(dark);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      applyThemeVars(next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const setTheme = useCallback((dark) => {
    setIsDark(dark);
    applyThemeVars(dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};