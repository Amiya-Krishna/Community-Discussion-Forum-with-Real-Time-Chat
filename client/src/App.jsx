import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Loader from "./components/Loader";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Discussion from "./pages/Discussion";
import ChatPage from "./pages/ChatPage";
import Notifications from "./pages/Notifications";

// Layout
import MainLayout from "./layouts/MainLayout";

// Route guard — redirects to / if not logged in
const Protected = ({ children }) => {
  const { user, initializing } = useAuth();
  if (initializing) return <Loader fullscreen text="Loading..." />;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

// Guest-only route — redirects to /dashboard if already logged in
const GuestOnly = ({ children }) => {
  const { user, initializing } = useAuth();
  if (initializing) return <Loader fullscreen text="Loading..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH — no layout */}
        <Route
          path="/"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestOnly>
              <ForgotPassword />
            </GuestOnly>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestOnly>
              <ResetPassword />
            </GuestOnly>
          }
        />

        {/* MAIN APP — wrapped in MainLayout (Navbar + Sidebar) */}
        <Route
          element={
            <Protected>
              <MainLayout />
            </Protected>
          }
        >
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/profile"            element={<Profile />} />
          <Route path="/chat"               element={<ChatPage />} />
          <Route path="/notifications"      element={<Notifications />} />
          <Route path="/discussion/:id"     element={<Discussion />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}