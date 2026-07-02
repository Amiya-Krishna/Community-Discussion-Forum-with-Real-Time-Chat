import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NOTIF_ICONS = {
  like: "❤️",
  reaction: "❤️",
  comment: "💬",
  follow: "👤",
  mention: "📣",
  message: "💬",
  system: "🔔",
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    axios.put("/api/notifications/read", {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).catch(() => {});
  };

  const markRead = (i) => {
    const n = notifs[i];
    setNotifs((prev) => prev.map((x, idx) => idx === i ? { ...x, read: true } : x));
    if (n?._id) {
      axios.put(`/api/notifications/${n._id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).catch(() => {});
    }
  };

  const openNotif = (i) => {
    const n = notifs[i];
    markRead(i);
    if (n?.link) navigate(n.link);
  };

  const deleteNotif = (i) => {
    setNotifs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  const filtered = filter === "unread" ? notifs.filter((n) => !n.read) : notifs;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .notif-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: ${isDark ? "#050508" : "#f8f7ff"};
          position: relative;
        }
        .notif-orb {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(108,71,255,0.1) 0%, transparent 70%);
          top: -200px; right: -200px; pointer-events: none; z-index: 0;
        }

        .notif-main { max-width: 680px; margin: 0 auto; padding: 36px 24px; position: relative; z-index: 1; }

        .notif-header {
          display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px;
        }
        .notif-title {
          font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
          color: ${isDark ? "#fff" : "#0f0a1e"};
        }
        .notif-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          color: #fff; font-size: 11px; font-weight: 700;
          width: 22px; height: 22px; border-radius: 50%;
          margin-left: 8px; vertical-align: middle;
        }
        .notif-sub { font-size: 14px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.4)"}; margin-top: 4px; }

        .btn-mark-all {
          background: none; border: 1px solid rgba(108,71,255,0.3);
          color: #a78bfa; border-radius: 8px; padding: 8px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
        }
        .btn-mark-all:hover { background: rgba(108,71,255,0.1); border-color: rgba(108,71,255,0.5); }

        .filter-tabs {
          display: flex; gap: 6px; margin-bottom: 20px;
        }
        .filter-tab {
          padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; border: none;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(15,10,30,0.05)"};
          color: ${isDark ? "rgba(255,255,255,0.45)" : "rgba(15,10,30,0.45)"};
        }
        .filter-tab.active {
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          color: #fff;
          box-shadow: 0 4px 14px rgba(108,71,255,0.35);
        }
        .filter-tab:not(.active):hover {
          background: ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.08)"};
          color: ${isDark ? "rgba(255,255,255,0.7)" : "#6c47ff"};
        }

        .notif-list { display: flex; flex-direction: column; gap: 8px; }

        .notif-item {
          display: flex; align-items: flex-start; gap: 14px;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)"};
          backdrop-filter: blur(12px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 16px; padding: 16px 18px;
          transition: all 0.25s; cursor: pointer;
          animation: slideIn 0.3s ease forwards;
          position: relative; overflow: hidden;
        }
        .notif-item:hover { transform: translateX(4px); border-color: rgba(108,71,255,0.2); }
        .notif-item.unread {
          border-left: 3px solid #6c47ff;
          background: ${isDark ? "rgba(108,71,255,0.07)" : "rgba(108,71,255,0.04)"};
        }
        .notif-item.unread::before {
          content: '';
          position: absolute; top: 18px; right: 18px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #6c47ff;
          box-shadow: 0 0 8px rgba(108,71,255,0.6);
        }

        .notif-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 20px;
          background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"};
        }
        .notif-content { flex: 1; min-width: 0; }
        .notif-msg {
          font-size: 14px; color: ${isDark ? "rgba(255,255,255,0.85)" : "#0f0a1e"};
          line-height: 1.5; margin-bottom: 4px;
        }
        .notif-time { font-size: 12px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)"}; }
        .notif-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
        .notif-btn {
          background: none; border: none; cursor: pointer; padding: 6px;
          border-radius: 8px; font-size: 14px; transition: all 0.15s;
          color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(15,10,30,0.3)"};
        }
        .notif-btn:hover { background: ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; color: ${isDark ? "#fff" : "#0f0a1e"}; }

        .empty-state {
          text-align: center; padding: 64px 20px;
          animation: fadeIn 0.5s ease forwards;
        }
        .empty-icon {
          font-size: 56px; margin-bottom: 16px;
          filter: grayscale(0.3);
        }
        .empty-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 8px; }
        .empty-sub { font-size: 14px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.4)"}; }

        .skeleton {
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"};
          border-radius: 16px; padding: 16px 18px;
          display: flex; gap: 14px; align-items: flex-start;
        }
        .skel-icon { width: 44px; height: 44px; border-radius: 12px; background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}; flex-shrink: 0; animation: shimmer 1.5s infinite; }
        .skel-line { height: 12px; border-radius: 6px; background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%, 100% { opacity: 0.5 } 50% { opacity: 1 } }
      `}</style>

      <div className="notif-root">
        <div className="notif-orb" />


        <div className="notif-main">
          <div className="notif-header">
            <div>
              <h1 className="notif-title">
                Notifications
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </h1>
              <p className="notif-sub">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="btn-mark-all" onClick={markAllRead}>
                ✓ Mark all read
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {["all", "unread"].map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton">
                  <div className="skel-icon" />
                  <div style={{ flex: 1 }}>
                    <div className="skel-line" style={{ width: "75%", marginBottom: 8 }} />
                    <div className="skel-line" style={{ width: "45%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{filter === "unread" ? "✅" : "🔔"}</div>
              <div className="empty-title">{filter === "unread" ? "All caught up!" : "No notifications yet"}</div>
              <p className="empty-sub">{filter === "unread" ? "No unread notifications right now." : "When you get notifications, they'll show up here."}</p>
            </div>
          ) : (
            <div className="notif-list">
              {filtered.map((n, i) => (
                <div key={n._id || i} className={`notif-item ${!n.read ? "unread" : ""}`} onClick={() => openNotif(i)}>
                  <div className="notif-icon-wrap">
                    {NOTIF_ICONS[n.type] || NOTIF_ICONS.system}
                  </div>
                  <div className="notif-content">
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}</div>
                  </div>
                  <div className="notif-actions" onClick={(e) => e.stopPropagation()}>
                    {!n.read && (
                      <button className="notif-btn" title="Mark as read" onClick={() => markRead(i)}>✓</button>
                    )}
                    <button className="notif-btn" title="Delete" onClick={() => deleteNotif(i)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}