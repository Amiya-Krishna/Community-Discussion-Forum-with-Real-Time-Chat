import { useState } from "react";
import axios from "axios";
import { timeAgo } from "../pages/Dashboard"; // re-use the helper
import { useAuth } from "../context/AuthContext";
import RichEditor from "./RichEditor";
import { renderPostHtml, stripHtml } from "../utils/richText";

// ── fallback if timeAgo isn't exported from Dashboard yet ───────────────────
function fmt(dateStr) {
  if (!dateStr) return "";
  try { return timeAgo(dateStr); } catch { return ""; }
}

const REACTIONS = [
  { key: "like", emoji: "👍" },
  { key: "love", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "wow", emoji: "😮" },
  { key: "sad", emoji: "😢" },
  { key: "celebrate", emoji: "🎉" },
];

function reactionCounts(reactions = []) {
  const counts = {};
  reactions.forEach((r) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
  return counts;
}

export default function PostCard({ post, refresh }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editMode, setEditMode]   = useState(false);
  const [editTitle, setEditTitle] = useState(post.title   || "");
  const [editBody,  setEditBody]  = useState(post.content || "");
  const [editImage, setEditImage] = useState(post.image || null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [shareToast, setShareToast] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reacting, setReacting] = useState(false);

  const token = localStorage.getItem("token");
  const authH = { headers: { Authorization: `Bearer ${token}` } };

  const myReaction = (post.reactions || []).find((r) => (r.user?._id || r.user) === user?._id);
  const counts = reactionCounts(post.reactions);
  const totalReactions = (post.reactions || []).length;
  const topReactions = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // ── post actions ────────────────────────────────────────────────────────────
  const handleReact = async (emoji = "like") => {
    if (reacting) return;
    setReacting(true);
    setShowReactionPicker(false);
    try { await axios.put(`/api/posts/${post._id}/react`, { emoji }, authH); refresh(); }
    catch (e) { console.error(e); }
    finally { setReacting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try { await axios.delete(`/api/posts/${post._id}`, authH); refresh(); }
    catch (e) { console.error(e); }
  };

  const handleEditSave = async () => {
    if (!stripHtml(editBody).trim()) return;
    try {
      await axios.put(`/api/posts/${post._id}`, { title: editTitle, content: editBody, image: editImage }, authH);
      setEditMode(false);
      refresh();
    } catch (e) { console.error(e); }
  };

  // ── share ───────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const url  = `${window.location.origin}/discussion/${post._id}`;
    const text = post.title ? `${post.title}\n${url}` : url;
    if (navigator.share) {
      try { await navigator.share({ title: post.title || "Post", text, url }); return; }
      catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2200);
    } catch { console.error("clipboard failed"); }
  };

  // ── comment actions ─────────────────────────────────────────────────────────
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(`/api/posts/${post._id}/comment`, { text: commentText }, authH);
      setCommentText("");
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async (cId) => {
    if (!window.confirm("Delete comment?")) return;
    try { await axios.delete(`/api/posts/${post._id}/comments/${cId}`, authH); refresh(); }
    catch (e) { console.error(e); }
  };

  const handleEditComment = async (cId) => {
    try {
      await axios.put(`/api/posts/${post._id}/comments/${cId}`, { text: editingCommentText }, authH);
      setEditingCommentId(null);
      setEditingCommentText("");
      refresh();
    } catch (e) { console.error(e); }
  };

  const authorInitial = (post.author?.name || post.author?.username || "U")[0].toUpperCase();

  return (
    <>
      <div className="post-card">
        {/* ── header ── */}
        <div className="post-header">
          <div className="post-avatar">{authorInitial}</div>
          <div className="post-meta">
            <div className="post-author">{post.author?.name || post.author?.username || "Unknown"}</div>
            <div className="post-time">{fmt(post.createdAt)}{post.updatedAt && post.updatedAt !== post.createdAt ? " · edited" : ""}</div>
          </div>
        </div>

        {/* ── body: view or edit mode ── */}
        {editMode ? (
          <div style={{ marginBottom: 14 }}>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Post title…"
              style={{
                width: "100%", boxSizing: "border-box",
                marginBottom: 8, padding: "9px 12px",
                borderRadius: 10, border: "1px solid rgba(108,71,255,.3)",
                background: "rgba(108,71,255,.06)",
                color: "inherit", fontFamily: "inherit", fontSize: 15, fontWeight: 700,
                outline: "none",
              }}
            />
            <RichEditor
              value={editBody}
              onChange={setEditBody}
              image={editImage}
              onImageChange={setEditImage}
              minHeight={70}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn-edit" onClick={handleEditSave}>💾 Save</button>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  padding: "7px 14px", borderRadius: 10, border: "none",
                  cursor: "pointer", background: "rgba(255,255,255,.08)",
                  color: "inherit", fontFamily: "inherit", fontSize: 13,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {(post.title) && <div className="post-title">{post.title}</div>}
            <div className="post-body" dangerouslySetInnerHTML={{ __html: renderPostHtml(post.content) }} />
            {post.image && (
              <div className="post-image-wrap">
                <img src={post.image} alt="" className="post-image" loading="lazy" />
              </div>
            )}
          </>
        )}

        {/* ── action bar ── */}
        {!editMode && (
          <div className="post-actions">
            <div
              className="reaction-wrap"
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              {showReactionPicker && (
                <div className="reaction-picker">
                  {REACTIONS.map((r) => (
                    <span
                      key={r.key}
                      className={`reaction-picker-item ${myReaction?.emoji === r.key ? "active" : ""}`}
                      onClick={() => handleReact(r.key)}
                      title={r.key}
                    >
                      {r.emoji}
                    </span>
                  ))}
                </div>
              )}
              <button
                className={`btn-like${myReaction ? " liked" : ""}`}
                onClick={() => handleReact(myReaction ? myReaction.emoji : "like")}
                title="React"
              >
                {myReaction ? REACTIONS.find((r) => r.key === myReaction.emoji)?.emoji || "👍" : "🤍"}
                {topReactions.length > 0 && (
                  <span className="reaction-summary">
                    {topReactions.map(([e]) => REACTIONS.find((r) => r.key === e)?.emoji || "").join("")}
                  </span>
                )}
                {" "}{totalReactions || ""}
              </button>
            </div>

            <button
              className="btn-like"
              onClick={() => setShowComments(!showComments)}
              title="Comments"
            >
              💬 {post.comments?.length || 0}
            </button>

            {(post.author?._id === user?._id || user?.isAdmin) && (
              <>
                <button className="btn-edit" onClick={() => setEditMode(true)} title="Edit post">
                  ✏️ Edit
                </button>
                <button className="btn-delete" onClick={handleDelete} title="Delete post">
                  🗑️ Delete
                </button>
              </>
            )}

            <button className="btn-share" onClick={handleShare} title="Share post">
              🔗 Share
            </button>
          </div>
        )}

        {/* ── comments section ── */}
        {showComments && (
          <div className="comments-section">
            {(post.comments || []).map((c) => {
              const cInitial = (c.user?.name || c.user?.username || "U")[0].toUpperCase();
              const commentUserId = (c.user?._id || c.user)?.toString();
              const canEdit = user?._id && commentUserId === user._id;
              const canDelete = user?._id && (canEdit || post.author?._id === user._id || user?.isAdmin);
              return (
                <div key={c._id} className="comment-item">
                  <div className="comment-avatar">{cInitial}</div>
                  <div className="comment-bubble">
                    <div className="comment-author">{c.user?.name || c.user?.username || "User"}</div>

                    {editingCommentId === c._id ? (
                      <>
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          rows={2}
                          style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "6px 10px", borderRadius: 8,
                            border: "1px solid rgba(108,71,255,.3)",
                            background: "rgba(108,71,255,.06)",
                            color: "inherit", fontFamily: "inherit", fontSize: 13,
                            resize: "vertical", outline: "none", marginBottom: 6,
                          }}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-comment-edit" onClick={() => handleEditComment(c._id)}>Save</button>
                          <button
                            onClick={() => { setEditingCommentId(null); setEditingCommentText(""); }}
                            style={{
                              padding: "3px 10px", borderRadius: 8, border: "none",
                              cursor: "pointer", background: "rgba(255,255,255,.1)",
                              color: "inherit", fontSize: 11,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="comment-text" dangerouslySetInnerHTML={{ __html: renderPostHtml(c.text) }} />
                        <div className="comment-footer">
                          <span className="comment-time">{fmt(c.createdAt)}</span>
                          {canEdit && (
                            <button
                              className="btn-comment-edit"
                              onClick={() => { setEditingCommentId(c._id); setEditingCommentText(c.text); }}
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="btn-comment-delete"
                              onClick={() => handleDeleteComment(c._id)}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* add comment */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                placeholder="Write a comment… use @name to mention"
                style={{
                  flex: 1, padding: "9px 14px", borderRadius: 12,
                  border: "1px solid rgba(108,71,255,.2)",
                  background: "rgba(108,71,255,.05)",
                  color: "inherit", fontFamily: "inherit", fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={handleAddComment}
                style={{
                  padding: "9px 16px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#6c47ff,#a78bfa)",
                  color: "#fff", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* share toast */}
      {shareToast && (
        <div className="share-toast">✅ Link copied to clipboard!</div>
      )}
    </>
  );
}
