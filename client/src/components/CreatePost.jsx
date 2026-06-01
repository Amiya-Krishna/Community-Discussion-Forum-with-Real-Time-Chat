import { useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function CreatePost({ refresh }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const { isDark } = useTheme();
  const { user } = useAuth();

  const getInitials = (name) => name ? name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "??";

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await axios.post("/api/posts", { title, content }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTitle(""); setContent(""); setExpanded(false); refresh();
    } finally { setPosting(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
        @keyframes expand{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .create-post {
          font-family: 'DM Sans', sans-serif;
          background: ${isDark ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.95)"};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.12)"};
          border-radius: 20px; padding: 18px 20px;
          box-shadow: ${isDark ? "none" : "0 4px 20px rgba(108,71,255,0.07)"};
          transition: border-color 0.2s;
        }
        .create-post:focus-within { border-color: rgba(108,71,255,0.25); }

        .cp-top { display: flex; gap: 12px; align-items: center; }
        .cp-avatar {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg,#6c47ff,#a855f7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #fff;
        }
        .cp-trigger {
          flex: 1; padding: 11px 16px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.05)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 100px;
          color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(15,10,30,0.3)"};
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          cursor: pointer; text-align: left; transition: all 0.18s;
        }
        .cp-trigger:hover {
          background: ${isDark ? "rgba(108,71,255,0.08)" : "rgba(108,71,255,0.08)"};
          border-color: rgba(108,71,255,0.25); color: ${isDark ? "rgba(255,255,255,0.5)" : "rgba(15,10,30,0.5)"};
        }

        .cp-expanded { margin-top: 14px; animation: expand 0.25s ease forwards; }
        .cp-title-input {
          width: 100%; padding: 11px 14px;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.04)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 12px; margin-bottom: 10px;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .cp-title-input::placeholder { color: ${isDark ? "rgba(255,255,255,0.18)" : "rgba(15,10,30,0.25)"}; font-weight: 400; font-family: 'DM Sans', sans-serif; }
        .cp-title-input:focus { border-color: rgba(108,71,255,0.4); box-shadow: 0 0 0 3px rgba(108,71,255,0.08); }

        .cp-textarea {
          width: 100%; min-height: 90px; resize: none; padding: 12px 14px;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.04)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 12px; margin-bottom: 14px;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .cp-textarea::placeholder { color: ${isDark ? "rgba(255,255,255,0.18)" : "rgba(15,10,30,0.25)"}; }
        .cp-textarea:focus { border-color: rgba(108,71,255,0.4); box-shadow: 0 0 0 3px rgba(108,71,255,0.08); }

        .cp-footer { display: flex; justify-content: space-between; align-items: center; }
        .cp-hints { display: flex; gap: 6px; }
        .cp-hint-btn {
          padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; transition: all 0.15s;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.06)"};
          color: ${isDark ? "rgba(255,255,255,0.4)" : "rgba(15,10,30,0.45)"};
          font-family: 'DM Sans', sans-serif;
        }
        .cp-hint-btn:hover { background: ${isDark ? "rgba(108,71,255,0.1)" : "rgba(108,71,255,0.1)"}; color: #a78bfa; }

        .cp-actions { display: flex; gap: 8px; }
        .cp-cancel {
          padding: 9px 16px; border-radius: 9px;
          background: none; border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.15)"};
          color: ${isDark ? "rgba(255,255,255,0.45)" : "rgba(15,10,30,0.45)"};
          font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.18s;
        }
        .cp-cancel:hover { background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}; }
        .cp-post-btn {
          padding: 9px 20px; border-radius: 9px; border: none;
          background: linear-gradient(135deg,#6c47ff,#a855f7);
          color: #fff; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 7px;
          box-shadow: 0 4px 14px rgba(108,71,255,0.35);
        }
        .cp-post-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(108,71,255,0.45); }
        .cp-post-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .cp-loader { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

        .char-hint { font-size: 11px; color: ${isDark ? "rgba(255,255,255,0.18)" : "rgba(15,10,30,0.25)"}; }
      `}</style>

      <div className="create-post">
        <div className="cp-top">
          <div className="cp-avatar">{getInitials(user?.name)}</div>
          {!expanded ? (
            <button className="cp-trigger" onClick={() => setExpanded(true)}>
              What's on your mind, {user?.name?.split(" ")[0] || "there"}?
            </button>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(15,10,30,0.5)" }}>
              Creating a post
            </div>
          )}
        </div>

        {expanded && (
          <div className="cp-expanded">
            <input
              className="cp-title-input"
              placeholder="Give your post a title... (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="cp-textarea"
              placeholder="Share your thoughts, questions, or ideas with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
            />
            <div className="cp-footer">
              <div className="cp-hints">
                <button className="cp-hint-btn">📷 Photo</button>
                <button className="cp-hint-btn">🔗 Link</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div className="char-hint">{content.length}/1000</div>
                <div className="cp-actions">
                  <button className="cp-cancel" onClick={() => { setExpanded(false); setTitle(""); setContent(""); }}>
                    Cancel
                  </button>
                  <button className="cp-post-btn" onClick={handleSubmit} disabled={posting || !content.trim()}>
                    {posting ? <span className="cp-loader" /> : "🚀"} Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}