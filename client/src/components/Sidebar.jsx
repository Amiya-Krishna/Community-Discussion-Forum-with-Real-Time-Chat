import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const { isDark } = useTheme();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const NAV = [
    { to: "/dashboard", icon: "◈", label: "Feed", desc: "Latest posts" },
    { to: "/chat", icon: "💬", label: "Messages", desc: "Direct chats" },
    { to: "/notifications", icon: "🔔", label: "Notifications", desc: "Stay updated" },
    { to: "/discussion/123", icon: "🗣️", label: "Discussion", desc: "Community threads" },
    { to: "/profile", icon: "👤", label: "Profile", desc: "Your account" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

        .sidebar {
          font-family: 'DM Sans', sans-serif;
          width: 240px; height: 100vh;
          position: sticky; top: 0;
          display: flex; flex-direction: column;
          background: ${isDark ? "rgba(164, 164, 171, 0.17)" : "rgba(248,247,255,0.95)"};
          backdrop-filter: blur(24px);
          border-right: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.1)"};
          padding: 24px 12px;
          gap: 4px;
          overflow-y: auto;
        }
        .sidebar::-webkit-scrollbar { width: 0; }

        .sidebar-section-label {
          font-size: 15px; font-weight: 1000; letter-spacing: 0.1em; text-transform: uppercase;
          color: ${isDark ? "rgba(28, 179, 28, 0.56)" : "rgba(15,10,30,0.25)"};
          padding: 8px 12px 4px;
        }

        .sidebar-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 12px;
          text-decoration: none; transition: all 0.18s;
          color: ${isDark ? "rgba(236, 230, 230, 0.82)" : "rgba(15,10,30,0.45)"};
          border: 1px solid transparent;
        }
        .sidebar-link:hover {
          background: ${isDark ? "rgba(108,71,255,0.08)" : "rgba(108,71,255,0.06)"};
          color: ${isDark ? "rgba(255,255,255,0.8)" : "#0f0a1e"};
        }
        .sidebar-link.active {
          background: ${isDark ? "rgba(108,71,255,0.15)" : "rgba(108,71,255,0.09)"};
          border-color: rgba(108,71,255,0.18);
          color: ${isDark ? "#c4b5fd" : "#6c47ff"};
        }

        .sl-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.07)"};
          transition: all 0.18s;
        }
        .sidebar-link.active .sl-icon {
          background: rgba(108,71,255,0.2);
        }
        .sl-text { flex: 1; min-width: 0; }
        .sl-label { font-size: 14px; font-weight: 500; line-height: 1.2; }
        .sl-desc { font-size: 11px; opacity: 0.6; margin-top: 1px; }
        .sl-active-bar {
          width: 6px; height: 6px; border-radius: 50%; background: #6c47ff;
          opacity: 0; transition: opacity 0.18s;
        }
        .sidebar-link.active .sl-active-bar { opacity: 1; }

        .sidebar-spacer { flex: 1; }

        @media (max-width: 480px) {
          .sidebar { width: 78vw; max-width: 280px; }
        }

      `}</style>

      <aside className="sidebar">

        <div className="sidebar-section-label">Navigation</div>

        {NAV.map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className={`sidebar-link ${isActive(to) ? "active" : ""}`} onClick={onNavigate}>
            <div className="sl-icon">{icon}</div>
            <div className="sl-text">
              <div className="sl-label">{label}</div>
              <div className="sl-desc">{desc}</div>
            </div>
            <div className="sl-active-bar" />
          </Link>
        ))}
      </aside>
    </>
  );
}