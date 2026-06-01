import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/auth/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(res.data);
        if (res.data.length > 0) setSelectedUser(res.data[0]);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  const AVATAR_COLORS = ["#6c47ff", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
  const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:0.9}}

        .chat-root {
          font-family: 'DM Sans', sans-serif;
          height: 100vh; display: flex; flex-direction: column;
          background: ${isDark ? "#050508" : "#f8f7ff"};
          overflow: hidden;
        }

        .chat-body { display: flex; flex: 1; overflow: hidden; position: relative; }

        /* SIDEBAR */
        .chat-sidebar {
          width: 300px; flex-shrink: 0; display: flex; flex-direction: column;
          background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)"};
          backdrop-filter: blur(20px);
          border-right: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.1)"};
          overflow: hidden;
        }
        .sidebar-header {
          padding: 20px 18px 14px;
          border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"};
        }
        .sidebar-title {
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800;
          color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .online-pill {
          font-size: 11px; font-weight: 600; padding: 3px 9px;
          background: rgba(16,185,129,0.15); color: #10b981;
          border-radius: 100px; border: 1px solid rgba(16,185,129,0.25);
        }
        .sidebar-search {
          position: relative;
        }
        .sidebar-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(15,10,30,0.25)"}; pointer-events: none; }
        .sidebar-search-input {
          width: 100%; padding: 10px 12px 10px 36px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.05)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.12)"};
          border-radius: 10px; color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .sidebar-search-input::placeholder { color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.3)"}; }
        .sidebar-search-input:focus { border-color: rgba(108,71,255,0.4); box-shadow: 0 0 0 3px rgba(108,71,255,0.08); }

        .user-list { flex: 1; overflow-y: auto; padding: 8px 0; }
        .user-list::-webkit-scrollbar { width: 4px; }
        .user-list::-webkit-scrollbar-track { background: transparent; }
        .user-list::-webkit-scrollbar-thumb { background: rgba(108,71,255,0.25); border-radius: 4px; }

        .user-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 18px; cursor: pointer;
          transition: background 0.15s; position: relative;
          border-left: 3px solid transparent;
        }
        .user-item:hover { background: ${isDark ? "rgba(108,71,255,0.07)" : "rgba(108,71,255,0.05)"}; }
        .user-item.active {
          background: ${isDark ? "rgba(108,71,255,0.12)" : "rgba(108,71,255,0.08)"};
          border-left-color: #6c47ff;
        }

        .user-avatar {
          width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #fff;
          position: relative;
        }
        .user-online-dot {
          width: 10px; height: 10px; background: #10b981;
          border-radius: 50%;
          border: 2px solid ${isDark ? "#050508" : "#f8f7ff"};
          position: absolute; bottom: -1px; right: -1px;
        }
        .user-info { flex: 1; min-width: 0; }
        .user-name {
          font-size: 14px; font-weight: 500;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;
        }
        .user-preview {
          font-size: 12px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)"};
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .user-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .user-time { font-size: 11px; color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(15,10,30,0.3)"}; }
        .unread-badge {
          width: 18px; height: 18px; background: linear-gradient(135deg, #6c47ff, #a855f7);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff;
        }

        .no-users {
          text-align: center; padding: 40px 20px;
          color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(15,10,30,0.3)"};
          font-size: 14px;
        }

        /* CHAT AREA */
        .chat-area { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }

        .select-placeholder {
          text-align: center; padding: 40px;
          animation: fadeIn 0.4s ease forwards;
        }
        .select-placeholder-icon { font-size: 56px; margin-bottom: 16px; }
        .select-placeholder-title {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700;
          color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 8px;
        }
        .select-placeholder-sub { font-size: 14px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.4)"}; }

        .skel-user { display: flex; align-items: center; gap: 12px; padding: 10px 18px; }
        .skel-av { width: 42px; height: 42px; border-radius: 13px; background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}; flex-shrink: 0; animation: shimmer 1.5s infinite; }
        .skel-line { border-radius: 6px; background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}; animation: shimmer 1.5s infinite; }
      `}</style>

      <div className="chat-root">
        <div className="chat-body">
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">
                💬 Messages
                <span className="online-pill">● Live</span>
              </div>
              <div className="sidebar-search">
                <span className="sidebar-search-icon">🔍</span>
                <input
                  type="text"
                  className="sidebar-search-input"
                  placeholder="Search people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="user-list">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="skel-user">
                    <div className="skel-av" />
                    <div style={{ flex: 1 }}>
                      <div className="skel-line" style={{ width: "60%", height: 12, marginBottom: 8 }} />
                      <div className="skel-line" style={{ width: "40%", height: 10 }} />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="no-users">No users found</div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className={`user-item ${selectedUser?._id === u._id ? "active" : ""}`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="user-avatar" style={{ background: getColor(u.name) }}>
                      {getInitials(u.name)}
                      {Math.random() > 0.5 && <span className="user-online-dot" />}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{u.name}</div>
                      <div className="user-preview">{u.email}</div>
                    </div>
                    <div className="user-meta">
                      <div className="user-time">now</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {selectedUser ? (
              <ChatBox roomId={selectedUser._id} selectedUser={selectedUser} />
            ) : (
              <div className="select-placeholder">
                <div className="select-placeholder-icon">👈</div>
                <div className="select-placeholder-title">Select a conversation</div>
                <p className="select-placeholder-sub">Choose someone from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}