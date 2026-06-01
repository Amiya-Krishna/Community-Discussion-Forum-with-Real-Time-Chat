import { useTheme } from "../context/ThemeContext";

const Loader = ({ size = "md", text = "", fullscreen = false }) => {
  const { isDark } = useTheme?.() || { isDark: true };

  const sizes = { sm: 24, md: 40, lg: 56 };
  const px = sizes[size] || sizes.md;

  const inner = (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(${px * 0.6}px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(${px * 0.6}px) rotate(-360deg); }
        }
        @keyframes pulse { 0%,100%{opacity:0.5;transform:scale(0.9)} 50%{opacity:1;transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .loader-wrap {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          animation: fadeIn 0.3s ease;
        }
        .loader-ring-wrap {
          position: relative;
          width: ${px}px; height: ${px}px;
          display: flex; align-items: center; justify-content: center;
        }
        .loader-ring {
          width: ${px}px; height: ${px}px;
          border-radius: 50%;
          border: ${Math.max(2, px / 12)}px solid rgba(108,71,255,0.15);
          border-top-color: #6c47ff;
          border-right-color: #a855f7;
          animation: spin 0.9s cubic-bezier(0.4,0,0.2,1) infinite;
          position: absolute;
        }
        .loader-dot {
          width: ${Math.max(4, px / 8)}px; height: ${Math.max(4, px / 8)}px;
          background: linear-gradient(135deg,#6c47ff,#a855f7);
          border-radius: 50%;
          animation: pulse 1.2s ease-in-out infinite;
          box-shadow: 0 0 ${px / 6}px rgba(108,71,255,0.5);
        }
        .loader-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgba(108,71,255,0.7);
          letter-spacing: 0.02em;
        }
      `}</style>
      <div className="loader-wrap">
        <div className="loader-ring-wrap">
          <div className="loader-ring" />
          <div className="loader-dot" />
        </div>
        {text && <div className="loader-text">{text}</div>}
      </div>
    </>
  );

  if (fullscreen) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: isDark ? "#050508" : "#f8f7ff",
      }}>
        {inner}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
      {inner}
    </div>
  );
};

export default Loader;