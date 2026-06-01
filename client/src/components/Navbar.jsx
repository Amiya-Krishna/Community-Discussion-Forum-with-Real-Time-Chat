import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Smart initials: first letter of first name + first letter of last name
// "John" → "J", "John Smith" → "JS", "John Michael Smith" → "JS"
const getSmartInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const NAV_LINKS = [
    { path: "/dashboard", label: "Feed", icon: "◈" },
    { path: "/chat", label: "Messages", icon: "💬" },
    { path: "/notifications", label: "Alerts", icon: "🔔" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

        .navbar {
          font-family: 'DM Sans', sans-serif;
          position: sticky; top: 0; z-index: 100;
          background: ${isDark ? "rgba(5,5,8,0.88)" : "rgba(248,247,255,0.9)"};
          backdrop-filter: blur(24px);
          border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.1)"};
          box-shadow: 0 2px 32px ${isDark ? "rgba(0,0,0,0.4)" : "rgba(108,71,255,0.06)"};
        }
        .navbar-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 24px; height: 62px;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── Sidebar Toggle ── */
        .sidebar-toggle {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.15)"};
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.06)"};
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0; padding: 0;
        }
        .sidebar-toggle:hover {
          background: ${isDark ? "rgba(108,71,255,0.12)" : "rgba(108,71,255,0.1)"};
          border-color: rgba(108,71,255,0.3);
          transform: scale(1.05);
        }
        .sidebar-toggle-line {
          display: block; height: 1.5px; border-radius: 2px;
          background: ${isDark ? "rgba(255,255,255,0.6)" : "rgba(15,10,30,0.55)"};
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          transform-origin: center;
        }
        /* Hamburger → X animation */
        .sidebar-toggle-line:nth-child(1) { width: 16px; }
        .sidebar-toggle-line:nth-child(2) { width: 12px; align-self: flex-start; margin-left: 11px; }
        .sidebar-toggle-line:nth-child(3) { width: 16px; }
        .sidebar-toggle.open .sidebar-toggle-line:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg); width: 16px;
        }
        .sidebar-toggle.open .sidebar-toggle-line:nth-child(2) {
          opacity: 0; transform: scaleX(0);
        }
        .sidebar-toggle.open .sidebar-toggle-line:nth-child(3) {
          transform: translateY(-6.5px) rotate(-45deg); width: 16px;
        }

        .navbar-logo {
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          margin-right: 12px; white-space: nowrap; text-decoration: none; border: none; background: none;
        }
        .navbar-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; box-shadow: 0 4px 12px rgba(108,71,255,0.4); flex-shrink: 0;
        }
        .navbar-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; border: none; transition: all 0.18s;
          background: transparent;
          color: ${isDark ? "rgba(255,255,255,0.45)" : "rgba(15,10,30,0.45)"};
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover {
          background: ${isDark ? "rgba(108,71,255,0.1)" : "rgba(108,71,255,0.07)"};
          color: ${isDark ? "rgba(255,255,255,0.85)" : "#0f0a1e"};
        }
        .nav-link.active {
          background: ${isDark ? "rgba(108,71,255,0.18)" : "rgba(108,71,255,0.1)"};
          color: ${isDark ? "#c4b5fd" : "#6c47ff"}; font-weight: 600;
        }
        .nav-link-dot { width: 6px; height: 6px; border-radius: 50%; background: #6c47ff; display: none; }
        .nav-link.active .nav-link-dot { display: block; }

        .navbar-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }
        .theme-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.15)"};
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.06)"};
          color: ${isDark ? "#facc15" : "#6c47ff"};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; transition: all 0.2s; flex-shrink: 0;
        }
        .theme-btn:hover { transform: rotate(20deg) scale(1.1); background: ${isDark ? "rgba(250,204,21,0.12)" : "rgba(108,71,255,0.12)"}; }
        .nav-divider { width: 1px; height: 24px; background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"}; margin: 0 4px; }

        /* ── Avatar with tooltip (no name shown) ── */
        .avatar-wrap {
          position: relative; display: flex; align-items: center;
        }
        .avatar-btn {
          display: flex; align-items: center;
          padding: 5px;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.06)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.15)"};
          border-radius: 100px; cursor: pointer; transition: all 0.18s;
        }
        .avatar-btn:hover { background: ${isDark ? "rgba(108,71,255,0.12)" : "rgba(108,71,255,0.1)"}; border-color: rgba(108,71,255,0.35); }
        .avatar-circle {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        /* Tooltip */
        .avatar-tooltip {
          position: absolute; top: calc(100% + 10px); left: 50%;
          transform: translateX(-50%) scale(0.92);
          background: ${isDark ? "rgba(108,71,255,0.92)" : "#6c47ff"};
          color: #fff; font-size: 12px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          padding: 5px 12px; border-radius: 8px; white-space: nowrap;
          opacity: 0; pointer-events: none;
          transition: opacity 0.18s, transform 0.18s;
          box-shadow: 0 4px 16px rgba(108,71,255,0.35);
        }
        .avatar-tooltip::before {
          content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
          border: 5px solid transparent; border-bottom-color: ${isDark ? "rgba(108,71,255,0.92)" : "#6c47ff"};
        }
        .avatar-wrap:hover .avatar-tooltip {
          opacity: 1; transform: translateX(-50%) scale(1);
        }

        .logout-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 9px;
          background: rgba(204, 11, 11, 0.91); border: 1px solid rgba(239,68,68,0.18);
          color: #e0d5d5; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.18s; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .logout-btn:hover { background: rgba(219,70,70,0.81); border-color: rgba(239,68,68,0.3); transform: translateY(-1px); }

        @media (max-width: 640px) {
          .navbar-inner { padding: 0 12px; }
          .nav-link span:last-child { display: none; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-inner">


          <button className="navbar-logo" onClick={() => navigate("/dashboard")}>
            <div className="navbar-logo-icon">✦</div>
            <span>Forum</span>
          </button>

          <div className="navbar-links">
            {NAV_LINKS.map(({ path, label, icon }) => (
              <button
                key={path}
                className={`nav-link ${isActive(path) ? "active" : ""}`}
                onClick={() => navigate(path)}
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="nav-link-dot" />
              </button>
            ))}
          </div>

          <div className="navbar-right">
            
             {/* ── Sidebar Toggle Button ── */}
          <button
            className={`sidebar-toggle ${sidebarOpen ? "open" : ""}`}
            onClick={onToggleSidebar}
            title={sidebarOpen ? "Hide Sidebar" : "Sidebar kholo"}
            aria-label="Toggle Sidebar"
          >
            <span className="sidebar-toggle-line" />
            <span className="sidebar-toggle-line" />
            <span className="sidebar-toggle-line" />
          </button>
            <button className="theme-btn" onClick={toggleTheme} title={isDark ? "Light Mode" : "Dark Mode"}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <div className="nav-divider" />

            {/* ── Avatar — no name shown, full name on hover ── */}
            <div className="avatar-wrap">
              <div className="avatar-btn" onClick={() => navigate("/profile")}>
                <div className="avatar-circle">{getSmartInitials(user?.name)}</div>
              </div>
              <div className="avatar-tooltip">{user?.name || "User"}</div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}