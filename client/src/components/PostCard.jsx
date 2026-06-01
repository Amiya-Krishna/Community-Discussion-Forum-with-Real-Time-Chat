import { useState } from "react";
import axios from "axios";
import CommentBox from "./CommentBox";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function PostCard({ post, refresh }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const isLiked = post.likes?.some((id) => (id?._id || id)?.toString() === user?._id);
  const isOwner = user && (user._id === (post.author?._id || post.author) || user.isAdmin);

  const [editing, setEditing] = useState(false);

  const AVATAR_COLORS = ["#6c47ff","#a855f7","#ec4899","#10b981","#f59e0b","#3b82f6"];
  const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length];
  const getInitials = (name) => name ? name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "??";
  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  const likePost = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await axios.put(`/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      refresh();
    } finally { setLiking(false); }
  };


  const updatePost = async () => {
    if (editing) return;
    const content = prompt("Edit post", post.content || "");
    if (content === null || !content.trim() || content.trim() === post.content) return;

    setEditing(true);
    try {
      await axios.put(`/api/posts/${post._id}`, {
        content: content.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      refresh();
    } finally {
      setEditing(false);
    }
  };

  const removePost = async () => {
    if (!confirm("Delete this post?")) return;
    await axios.delete(`/api/posts/${post._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    refresh();
  };

  const authorName = post.author?.name || "Anonymous";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes heartPop { 0%{transform:scale(1)} 40%{transform:scale(1.4)} 100%{transform:scale(1)} }

        .post-card {
          font-family: 'DM Sans', sans-serif;
          background: ${isDark ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.92)"};
          backdrop-filter: blur(16px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 20px; padding: 20px 22px;
          transition: all 0.22s;
          box-shadow: ${isDark ? "none" : "0 4px 20px rgba(108,71,255,0.06)"};
        }
        .post-card:hover {
          border-color: rgba(108,71,255,0.2);
          box-shadow: ${isDark ? "0 0 0 1px rgba(108,71,255,0.12),0 8px 32px rgba(0,0,0,0.2)" : "0 8px 32px rgba(108,71,255,0.1)"};
          transform: translateY(-1px);
        }

        .post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .post-av {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #fff;
        }
        .post-author-name { font-size: 14px; font-weight: 600; color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 1px; }
        .post-time { font-size: 12px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)"}; }
        .post-badge {
          margin-left: auto; padding: 3px 10px;
          background: rgba(108,71,255,0.1); border: 1px solid rgba(108,71,255,0.2);
          border-radius: 100px; font-size: 11px; color: #a78bfa; font-weight: 600;
        }

        .post-title {
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700;
          color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 8px; line-height: 1.3;
        }
        .post-content {
          font-size: 14px; line-height: 1.65;
          color: ${isDark ? "rgba(255,255,255,0.62)" : "rgba(15,10,30,0.62)"};
          margin-bottom: 16px;
          display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
        }

        .post-actions {
          display: flex; align-items: center; gap: 6px;
          padding-top: 14px;
          border-top: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"};
        }
        .act-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 9px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.18s;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.05)"};
          color: ${isDark ? "rgba(255,255,255,0.5)" : "rgba(15,10,30,0.5)"};
        }
        .act-btn:hover { background: ${isDark ? "rgba(255,255,255,0.09)" : "rgba(108,71,255,0.09)"}; color: #a78bfa; }
        .act-btn.liked { color: #f87171; background: rgba(248,113,113,0.1); }
        .act-btn.liked:hover { background: rgba(248,113,113,0.15); }
        .act-btn.liked .heart { animation: heartPop 0.35s ease; }
        .act-btn:active { transform: scale(0.96); }

/* Edit button (blue box) */
.act-edit {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.act-edit:hover {
  opacity: 0.9;
}

/* Delete button (red box) */
.act-delete {
  margin-left: auto;
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.act-delete:hover {
  opacity: 0.9;
}
      `}</style>

      <div className="post-card">
        <div className="post-header">
          <div className="post-av" style={{ background: getColor(authorName) }}>
            {getInitials(authorName)}
          </div>
          <div>
            <div className="post-author-name">{authorName}</div>
            <div className="post-time">{post.createdAt ? timeAgo(post.createdAt) : "recently"}</div>
          </div>
          {post.category && <span className="post-badge">{post.category}</span>}
        </div>

        {post.title && <div className="post-title">{post.title}</div>}
        <div className="post-content">{post.content}</div>

        <div className="post-actions">
          <button className={`act-btn ${isLiked ? "liked" : ""}`} onClick={likePost} disabled={liking}>
            <span className="heart">{isLiked ? "❤️" : "🤍"}</span>
            {post.likes?.length || 0}
          </button>

          <button className="act-btn" onClick={() => setShowComments(!showComments)}>
            💬 {post.comments?.length || 0}
            {showComments ? " ▲" : " ▼"}
          </button>

          <button className="act-btn">
            🔗 Share
          </button>

          {isOwner && (
                <button className="act-delete" onClick={removePost} title="Delete post">
            Delete
          </button>
          )}
          {isOwner && (
           <button className="act-edit" onClick={updatePost} disabled={editing}>
        Edit
      </button>
          )}

        </div>

        {showComments && <CommentBox post={post} refresh={refresh} />}
      </div>
    </>
  );
}
