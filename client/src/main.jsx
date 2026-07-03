import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import { API_BASE } from "./utils/apiBase";

// Global axios base URL — change once here, applies everywhere
axios.defaults.baseURL = API_BASE || "";

// Global axios timeout
axios.defaults.timeout = 10000;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);