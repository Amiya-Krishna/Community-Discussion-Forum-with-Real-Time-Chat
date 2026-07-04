import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

// Pages that default to a full-width layout (sidebar starts closed here),
// but the hamburger button can still open it like on any other page.
const SIDEBAR_DEFAULT_HIDDEN = ["/chat"];

const MainLayout = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  // On mobile the sidebar starts closed (it behaves like a drawer/overlay there)
  const [sidebarHidden, setSidebarHidden] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : SIDEBAR_DEFAULT_HIDDEN.includes(location.pathname)
  );
  const hideSidebar = sidebarHidden;
  const [pageKey, setPageKey] = useState(location.pathname);

  // Track viewport size so we know whether the sidebar should behave as an
  // inline column (desktop) or a slide-over drawer with backdrop (mobile).
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Animate page transitions + apply each route's default sidebar state.
  // The hamburger toggle always keeps working afterwards — this only sets
  // what the sidebar looks like the moment you land on a page.
  useEffect(() => {
    setPageKey(location.pathname);
    if (isMobile) {
      setSidebarHidden(true);
    } else {
      setSidebarHidden(SIDEBAR_DEFAULT_HIDDEN.includes(location.pathname));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .layout-root {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg-primary, ${isDark ? "#050508" : "#f8f7ff"});
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        /* Subtle mesh gradient behind everything */
        .layout-root::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: ${isDark
            ? "radial-gradient(ellipse 60% 50% at 70% 0%, rgba(108,71,255,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(0,229,255,0.04) 0%, transparent 60%)"
            : "radial-gradient(ellipse 60% 50% at 70% 0%, rgba(108,71,255,0.05) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(0,229,255,0.03) 0%, transparent 60%)"};
        }

        .layout-sidebar {
          position: relative; z-index: 10; flex-shrink: 0;
          transform: translateX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .layout-sidebar.hidden {
          width: 0; overflow: hidden;
          transform: translateX(-100%);
        }

        .layout-main {
          flex: 1; display: flex; flex-direction: column;
          overflow: hidden; position: relative; z-index: 1;
          min-width: 0;
        }

        .layout-content {
          flex: 1; overflow-y: auto;
          padding: 0;
          scroll-behavior: smooth;
        }
        .layout-content::-webkit-scrollbar { width: 6px; }
        .layout-content::-webkit-scrollbar-track { background: transparent; }
        .layout-content::-webkit-scrollbar-thumb {
          background: ${isDark ? "rgba(108,71,255,0.2)" : "rgba(108,71,255,0.15)"};
          border-radius: 6px;
        }
        .layout-content::-webkit-scrollbar-thumb:hover {
          background: rgba(108,71,255,0.35);
        }

        .page-transition {
          animation: pageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          min-height: 100%;
        }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile: sidebar overlays */
        @media (max-width: 768px) {
          .layout-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            z-index: 50;
            box-shadow: ${hideSidebar ? "none" : "0 0 40px rgba(0,0,0,0.5)"};
          }
        }

        .layout-backdrop {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px);
          animation: fadeInBackdrop 0.2s ease forwards;
        }
        @keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="layout-root">
        {isMobile && !hideSidebar && (
          <div className="layout-backdrop" onClick={() => setSidebarHidden(true)} />
        )}
        <div className={`layout-sidebar ${hideSidebar ? "hidden" : ""}`}>
          <Sidebar onNavigate={() => isMobile && setSidebarHidden(true)} />
        </div>

        <div className="layout-main">
          <Navbar sidebarOpen={!hideSidebar} onToggleSidebar={() => setSidebarHidden((value) => !value)} />
          <div className="layout-content">
            <div className="page-transition" key={pageKey}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;