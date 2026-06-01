import { useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function CommentBox({ post, refresh }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const { isDark } = useTheme();
  const { user } = useAuth();

  const getInitials = (name) => name ? name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "??";
  const COLORS = ["#6c47ff","#a855f7","#ec4899","#10b981","#f59e0b"];
  const getColor = (name) => COLORS[(name?.charCodeAt(0)||0) % COLORS.length];

  const addComment = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await axios.post(`/api/posts/${post._id}/comment`, { text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setText("");
      refresh();
    } finally { setPosting(false); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); }
  };

  const editComment = async (comment) => {
    const currentUserId = user?._id;
    const commentUserId = (comment.user?._id || comment.user)?.toString();
    if (!currentUserId || commentUserId !== currentUserId) return;

    const nextText = prompt("Edit comment", comment.text || "");
    if (nextText === null || !nextText.trim() || nextText.trim() === comment.text) return;

    await axios.put(`/api/posts/${post._id}/comments/${comment._id}`, { text: nextText.trim() }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    refresh();
  };

  const deleteComment = async (comment) => {
    const currentUserId = user?._id;
    const commentUserId = (comment.user?._id || comment.user)?.toString();
    const postAuthorId = (post.author?._id || post.author)?.toString();
    if (!currentUserId || (commentUserId !== currentUserId && postAuthorId !== currentUserId && !user?.isAdmin)) return;
    if (!confirm("Delete this comment?")) return;

    await axios.delete(`/api/posts/${post._id}/comments/${comment._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    refresh();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .cbox {
          font-family: 'DM Sans', sans-serif;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"};
          animation: fadeIn 0.3s ease;
        }

        .cbox-compose { display: flex; gap: 10px; align-items: flex-end; margin-bottom: 14px; }
        .cbox-my-av {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#6c47ff,#a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
        }
        .cbox-input-wrap { flex: 1; position: relative; }
        .cbox-input {
          width: 100%; padding: 10px 44px 10px 14px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.04)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.1)"};
          border-radius: 12px;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .cbox-input::placeholder { color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.25)"}; }
        .cbox-input:focus { border-color: rgba(108,71,255,0.45); box-shadow: 0 0 0 3px rgba(108,71,255,0.08); }
        .cbox-send {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(108,71,255,0.35)"};
          font-size: 16px; transition: all 0.15s; padding: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .cbox-send:hover:not(:disabled) { color: #a78bfa; transform: translateY(-50%) scale(1.15); }
        .cbox-send:disabled { opacity: 0.3; cursor: not-allowed; }
        .cbox-loader { width: 13px; height: 13px; border: 2px solid rgba(108,71,255,0.3); border-top-color: #6c47ff; border-radius: 50%; animation: spin 0.7s linear infinite; }

        .cbox-list { display: flex; flex-direction: column; gap: 8px; }
        .cbox-comment { display: flex; gap: 8px; align-items: flex-start; }
        .cbox-av {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff; align-self: flex-start;
          margin-top: 1px;
        }
        .cbox-bubble {
          flex: 1;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.04)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.09)"};
          border-radius: 0 12px 12px 12px;
          padding: 8px 12px;
        }
        .cbox-comment-author { font-size: 12px; font-weight: 600; color: ${isDark ? "rgba(255,255,255,0.55)" : "rgba(15,10,30,0.55)"}; margin-bottom: 3px; }
        .cbox-comment-text { font-size: 13px; color: ${isDark ? "rgba(255,255,255,0.75)" : "rgba(15,10,30,0.7)"}; line-height: 1.5; }
        .cbox-comment-actions { display: flex; gap: 8px; margin-top: 6px; }
        .cbox-action-btn {border: none; cursor: pointer; padding: 3px 8px; font-size: 12px; border-radius: 6px; color: #fff;}}

      .cbox-action-btn:hover {opacity: 0.9;}

      /* Edit = Blue box */
      .cbox-action-btn:not(.danger) {background: #2563eb;}

      /* Delete = Red box */
      .cbox-action-btn.danger {background: #dc2626;}
      
        .cbox-empty { font-size: 13px; color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.25)"}; text-align: center; padding: 8px 0; }
      `}</style>

      <div className="cbox">
        {/* Compose */}
        <div className="cbox-compose">
          <div className="cbox-my-av">{getInitials(user?.name)}</div>
          <div className="cbox-input-wrap">
            <input
              className="cbox-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Write a comment... (Enter to post)"
            />
            <button className="cbox-send" onClick={addComment} disabled={posting || !text.trim()}>
              {posting ? <span className="cbox-loader" /> : "➤"}
            </button>
          </div>
        </div>

        {/* List */}
        {(post.comments || []).map((c) => {
          const username =
            typeof c.user === "object" ? c.user.name : "User";
          const commentUserId = (c.user?._id || c.user)?.toString();
          const postAuthorId = (post.author?._id || post.author)?.toString();
          const canEdit = user?._id && commentUserId === user._id;
          const canDelete = user?._id && (canEdit || postAuthorId === user._id || user.isAdmin);

          return (
            <div key={c._id} className="cbox-comment">
              <div
                className="cbox-av"
                style={{ background: getColor(username) }}
              >
                {getInitials(username)}
              </div>

              <div className="cbox-bubble">
                <div className="cbox-comment-author">
                  {username}
                </div>
                <div className="cbox-comment-text" onDoubleClick={() => editComment(c)}>{c.text}</div>
                {(canEdit || canDelete) && (
                  <div className="cbox-comment-actions">
                    {canEdit && (
                      <button className="cbox-action-btn" onClick={() => editComment(c)}>Edit</button>
                    )}
                    {canDelete && (
                      <button className="cbox-action-btn danger" onClick={() => deleteComment(c)}>Delete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
