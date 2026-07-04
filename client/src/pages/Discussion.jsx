import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { createPortal } from "react-dom";

const REACTIONS = ["❤️", "🔥", "👍", "😂", "😮", "🎉", "💡"];
const DISCUSSION_POST_KEY = "discussion_post";
const DISCUSSION_COMMENTS_KEY = "discussion_comments";

const DEFAULT_POST = {
  category: "💡 Discussion",
  title: "What's the future of AI in software development?",
  body: "Artificial intelligence is rapidly transforming the way we write, test, and deploy code. From intelligent autocomplete to full feature generation — where do you think this is headed in the next 5 years?",
  deleted: false,
};

const MOCK_COMMENTS = [
  {
    id: 1,
    author: "Aryan K.",
    initials: "AK",
    color: "#6c47ff",
    text: "This is a really interesting topic! I've been thinking about this for a while — the pace of change is genuinely impressive.",
    time: "2h ago",
    likes: 12,
    liked: false,
    bookmarked: false,
    reactions: { "❤️": 3, "🔥": 2 },
    pinned: true,
    verified: false,
    replies: [
      { id: 11, author: "Priya S.", initials: "PS", color: "#ec4899", text: "Totally agree with you Aryan!", time: "1h ago" },
    ],
  },
  {
    id: 2,
    author: "Priya S.",
    initials: "PS",
    color: "#ec4899",
    text: "Great post! Would love to hear more thoughts on this from the community. AI copilots are just the beginning.",
    time: "1h ago",
    likes: 7,
    liked: false,
    bookmarked: false,
    reactions: { "👍": 5 },
    pinned: false,
    verified: true,
    replies: [],
  },
  {
    id: 3,
    author: "Rohan M.",
    initials: "RM",
    color: "#10b981",
    text: "Very well written! AI won't replace developers but developers using AI will replace those who don't. That's my take.",
    time: "45m ago",
    likes: 4,
    liked: false,
    bookmarked: false,
    reactions: {},
    pinned: false,
    verified: false,
    replies: [],
  },
];

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: "var(--toast-bg, #1a1a2e)", color: "#fff",
      padding: "10px 18px", borderRadius: "10px", fontSize: "13px",
      display: "flex", alignItems: "center", gap: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      animation: "fadeUp 0.25s ease",
    }}>
      {message}
    </div>
  );
};

// ── ReactionPicker ───────────────────────────────────────────────────────────
const ReactionPicker = ({ onPick, isDark }) => (
  <div style={{
    position: "absolute", bottom: "calc(100% + 8px)", left: 0,
    background: isDark ? "rgba(20,17,30,0.97)" : "#fff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.18)"}`,
    borderRadius: "14px", padding: "8px", display: "flex", gap: "4px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.2)", zIndex: 50,
    animation: "popIn 0.18s ease",
  }}>
    {REACTIONS.map((e) => (
      <button key={e} onClick={() => onPick(e)} style={{
        background: "none", border: "none", fontSize: "20px", cursor: "pointer",
        padding: "5px 7px", borderRadius: "8px", transition: "transform 0.15s",
      }}
        onMouseEnter={ev => ev.currentTarget.style.transform = "scale(1.3)"}
        onMouseLeave={ev => ev.currentTarget.style.transform = "scale(1)"}
      >{e}</button>
    ))}
  </div>
);

// ── CommentMenu ──────────────────────────────────────────────────────────────
const CommentMenu = ({ comment, onEdit, onDelete, onReply, onPin, onCopyLink, onReport, isDark }) => {
  const menuRef = useRef(null);

  const item = (icon, label, action, danger = false) => (
    <button onClick={action} style={{
      display: "flex", alignItems: "center", gap: "9px",
      padding: "9px 14px", fontSize: "13px", cursor: "pointer",
      color: danger ? "#ef4444" : (isDark ? "rgba(255,255,255,0.7)" : "rgba(75, 29, 213, 0.88)"),
      background: "none", border: "none", width: "100%", textAlign: "left",
      fontFamily: "inherit", transition: "background 0.15s",
    }}
      onMouseEnter={ev => ev.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.06)"}
      onMouseLeave={ev => ev.currentTarget.style.background = "none"}
    >
      <span>{icon}</span> {label}
    </button>
  );

  return (
    <div ref={menuRef} style={{
      position: "absolute", right: -170, top: "calc(100% + 6px)",
      background: isDark ? "rgba(18,15,28,0.98)" : "#fff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.15)"}`,
      borderRadius: "12px", minWidth: "160px", zIndex: 9999,
      boxShadow: "0 8px 28px rgba(0,0,0,0.18)", overflow: "visible",
    }}>
      {item("↩️", "Reply", onReply)}
      {item("✏️", "Edit", onEdit)}
      {item("🔗", "Copy link", onCopyLink)}
      {item(comment.pinned ? "📌" : "📌", comment.pinned ? "Unpin" : "Pin", onPin)}
      <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.08)", margin: "4px 0" }} />
      {item("🚩", "Report", onReport)}
      {item("🗑️", "Delete", onDelete, true)}
    </div>
  );
};

// ── NestedReply ──────────────────────────────────────────────────────────────
const NestedReply = ({ reply, isDark, onEditReplySave, onDeleteReply }) => {
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(reply.text);

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px", animation: "fadeUp 0.25s ease" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
        background: reply.color, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff",
      }}>{reply.initials}</div>
      <div style={{
        flex: 1,
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.04)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"}`,
        borderRadius: "0 10px 10px 10px", padding: "8px 12px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: isDark ? "#fff" : "#0f0a1e" }}>{reply.author}</span>
            <span style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)", marginLeft: "8px" }}>{reply.time}</span>
          </div>
          {/* Edit & Delete buttons for nested reply */}
          {!editMode && (
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={() => { setEditText(reply.text); setEditMode(true); }}
                style={{
                  background: "rgba(37,99,235,0.1)",
                  border: "1px solid rgba(37,99,235,0.25)",
                  borderRadius: "6px",
                  padding: "3px 9px",
                  fontSize: "11px",
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  transition: "background 0.15s, color 0.15s, transform 0.15s",
                }}
                onMouseEnter={ev => { ev.currentTarget.style.background = "#2563eb"; ev.currentTarget.style.color = "#fff"; ev.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(37,99,235,0.1)"; ev.currentTarget.style.color = "#3b82f6"; ev.currentTarget.style.transform = "none"; }}
              >✏️ Edit</button>
              <button
                onClick={() => onDeleteReply(reply)}
                style={{
                  background: "rgba(220,38,38,0.1)",
                  border: "1px solid rgba(220,38,38,0.25)",
                  borderRadius: "6px",
                  padding: "3px 9px",
                  fontSize: "11px",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  transition: "background 0.15s, color 0.15s, transform 0.15s",
                }}
                onMouseEnter={ev => { ev.currentTarget.style.background = "#dc2626"; ev.currentTarget.style.color = "#fff"; ev.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(220,38,38,0.1)"; ev.currentTarget.style.color = "#ef4444"; ev.currentTarget.style.transform = "none"; }}
              >🗑️ Delete</button>
            </div>
          )}
        </div>

        {editMode ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "6px 10px", borderRadius: "8px",
                border: "1px solid rgba(108,71,255,0.3)",
                background: isDark ? "rgba(108,71,255,0.08)" : "rgba(108,71,255,0.05)",
                color: isDark ? "#fff" : "#0f0a1e",
                fontFamily: "inherit", fontSize: "12px",
                resize: "vertical", outline: "none", marginBottom: "6px",
              }}
            />
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => { onEditReplySave(reply.id, editText); setEditMode(false); }}
                style={{
                  background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
                  borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: 600,
                  color: "#3b82f6", cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={ev => { ev.currentTarget.style.background = "#2563eb"; ev.currentTarget.style.color = "#fff"; }}
                onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(37,99,235,0.1)"; ev.currentTarget.style.color = "#3b82f6"; }}
              >💾 Save</button>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "3px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(15,10,30,0.5)", fontFamily: "inherit",
                }}
              >Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(15,10,30,0.65)", lineHeight: 1.55 }}>{reply.text}</div>
        )}
      </div>
    </div>
  );
};

// ── CommentItem ──────────────────────────────────────────────────────────────
const CommentItem = ({
  comment, isDark, searchQuery,
  onLike, onBookmark, onReply, onEditSave, onDelete, onAddReaction,
  onPin, onCopyLink, onReport, onEditReplySave, onDeleteReply,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(comment.pinned);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const menuRef = useRef(null);
  const pickerRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === searchQuery.toLowerCase()
        ? <mark key={i} style={{ background: "#fde68a", color: "#92400e", borderRadius: "3px", padding: "0 2px" }}>{p}</mark>
        : p
    );
  };

  const actionBtn = (label, icon, onClick, active = false, activeColor = "#a78bfa") => (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer", padding: "4px 10px",
      borderRadius: "8px", fontSize: "13px", fontWeight: 500,
      color: active ? activeColor : (isDark ? "rgba(255,255,255,0.4)" : "rgba(15,10,30,0.45)"),
      display: "flex", alignItems: "center", gap: "5px",
      transition: "all 0.15s", fontFamily: "inherit",
    }}
      onMouseEnter={ev => ev.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.07)"}
      onMouseLeave={ev => ev.currentTarget.style.background = "none"}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{
      display: "flex", gap: "12px", marginBottom: "16px",
      animation: "fadeUp 0.3s ease",
    }}>
      {/* Avatar */}
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
        background: comment.color, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff",
      }}>{comment.initials}</div>

      {/* Bubble */}
      <div style={{
        flex: 1,
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)",
        border: `1px solid ${comment.pinned ? "rgba(108,71,255,0.4)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)")}`,
        borderRadius: "0 16px 16px 16px",
        boxShadow: comment.pinned ? (isDark ? "0 0 0 1px rgba(108,71,255,0.15)" : "0 0 0 3px rgba(108,71,255,0.06)") : "none",
        overflow: "visible",
      }}>
        {/* Header */}
        <div style={{ padding: "12px 14px 0", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#fff" : "#0f0a1e" }}>{comment.author}</span>
                {comment.pinned && (
                  <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "10px", background: "rgba(108,71,255,0.12)", color: "#a78bfa", border: "1px solid rgba(108,71,255,0.2)" }}>📌 Pinned</span>
                )}
                {comment.verified && (
                  <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>✓ Verified</span>
                )}
              </div>
              <div style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)", marginTop: "2px" }}>{comment.time}</div>
            </div>
            {/* 3-dot menu */}
            <div ref={menuRef} style={{ position: "relative", zIndex: 1000 }}>
              <button
                ref={btnRef}
                onClick={() => {
                  const rect = btnRef.current.getBoundingClientRect();
                  setMenuPos({
                    top: rect.bottom + window.scrollY,
                    left: rect.right - 160,
                  });
                  setMenuOpen((prev) => !prev);
                  setPickerOpen(false);
                }} style={{
                  background: "none", border: "none", cursor: "pointer", padding: "4px 6px",
                  borderRadius: "6px", fontSize: "16px", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.35)",
                  lineHeight: 1, transition: "all 0.15s",
                }}
                onMouseEnter={ev => ev.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.07)"}
                onMouseLeave={ev => ev.currentTarget.style.background = "none"}
                aria-label="Comment options"
              >⋯</button>
              {menuOpen &&
                createPortal(
                  <div style={{
                    position: "absolute",
                    top: menuPos?.top,
                    left: menuPos?.left,
                    zIndex: 999999
                  }}>
                    <CommentMenu
                      comment={comment}
                      isDark={isDark}
                      onReply={() => { onReply(comment); setMenuOpen(false); }}
                      onEdit={() => { setEditText(comment.text); setEditMode(true); setMenuOpen(false); }}
                      onDelete={() => { onDelete(comment.id); setMenuOpen(false); }}
                      onPin={() => { onPin(comment.id); setMenuOpen(false); }}
                      onCopyLink={() => { onCopyLink(comment.id); setMenuOpen(false); }}
                      onReport={() => { onReport(comment.id); setMenuOpen(false); }}
                    />
                  </div>,
                  document.body
                )
              }
            </div>
          </div>

          {/* Text */}
          {editMode ? (
            <div style={{ marginBottom: "10px" }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                autoFocus
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "9px 12px", borderRadius: "10px",
                  border: "1px solid rgba(108,71,255,0.3)",
                  background: isDark ? "rgba(108,71,255,0.08)" : "rgba(108,71,255,0.05)",
                  color: isDark ? "#fff" : "#0f0a1e",
                  fontFamily: "inherit", fontSize: "13px",
                  resize: "vertical", outline: "none", marginBottom: "8px",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => { onEditSave(comment.id, editText); setEditMode(false); }}
                  style={{
                    background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
                    borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: 600,
                    color: "#3b82f6", cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={ev => { ev.currentTarget.style.background = "#2563eb"; ev.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(37,99,235,0.1)"; ev.currentTarget.style.color = "#3b82f6"; }}
                >💾 Save</button>
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(15,10,30,0.5)", fontFamily: "inherit",
                  }}
                >Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{
              fontSize: "14px", color: isDark ? "rgba(255,255,255,0.72)" : "rgba(15,10,30,0.7)",
              lineHeight: 1.6, marginBottom: "10px",
            }}>
              {highlightText(comment.text)}
            </div>
          )}
        </div>

        {/* Actions bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap",
          padding: "8px 10px",
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(108,71,255,0.03)",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.07)"}`,
        }}>
          {/* Like */}
          {actionBtn(comment.likes, comment.liked ? "❤️" : "🤍", () => onLike(comment.id), comment.liked, "#f87171")}
          {/* Bookmark */}
          {actionBtn("", comment.bookmarked ? "🔖" : "🔖", () => onBookmark(comment.id), comment.bookmarked, "#f59e0b")}
          {/* Reply */}
          {actionBtn("Reply", "↩️", () => onReply(comment))}

          {/* Reaction chips */}
          {Object.entries(comment.reactions).filter(([, n]) => n > 0).map(([emoji, count]) => (
            <button key={emoji} onClick={() => onAddReaction(comment.id, emoji)} style={{
              padding: "3px 8px", borderRadius: "100px", fontSize: "12px",
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.06)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.12)"}`,
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(15,10,30,0.55)",
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={ev => { ev.currentTarget.style.background = "rgba(108,71,255,0.12)"; ev.currentTarget.style.borderColor = "rgba(108,71,255,0.28)"; }}
              onMouseLeave={ev => { ev.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.06)"; ev.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.12)"; }}
            >{emoji} {count}</button>
          ))}

          {/* React picker */}
          <div ref={pickerRef} style={{ position: "relative", zIndex: 1000 }}>
            {actionBtn("", "😊", () => { setPickerOpen(!pickerOpen); setMenuOpen(false); })}
            {pickerOpen && <ReactionPicker isDark={isDark} onPick={(e) => { onAddReaction(comment.id, e); setPickerOpen(false); }} />}
          </div>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ padding: "0 14px" }}>
            <button onClick={() => setRepliesOpen(!repliesOpen)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "12px", color: "#a78bfa", padding: "6px 0 8px",
              display: "flex", alignItems: "center", gap: "5px", fontFamily: "inherit",
            }}>
              {repliesOpen ? "▲" : "▼"} {repliesOpen ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
            {repliesOpen && (
              <div style={{ borderLeft: `2px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.15)"}`, paddingLeft: "12px", marginBottom: "10px" }}>
                {comment.replies.map((r) => (
                  <NestedReply
                    key={r.id}
                    reply={r}
                    isDark={isDark}
                    onEditReplySave={(replyId, text) => onEditReplySave(comment.id, replyId, text)}
                    onDeleteReply={(reply) => onDeleteReply(comment.id, reply)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Discussion Component ────────────────────────────────────────────────
const Discussion = () => {
  const { isDark } = useTheme();
  const [post, setPost] = useState(() => {
    const saved = localStorage.getItem(DISCUSSION_POST_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_POST;
  });
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem(DISCUSSION_COMMENTS_KEY);
    return saved ? JSON.parse(saved) : MOCK_COMMENTS;
  });
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("All");
  const [toast, setToast] = useState(null);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostBody, setEditPostBody] = useState("");

  useEffect(() => { localStorage.setItem(DISCUSSION_POST_KEY, JSON.stringify(post)); }, [post]);
  useEffect(() => { localStorage.setItem(DISCUSSION_COMMENTS_KEY, JSON.stringify(comments)); }, [comments]);

  const showToast = (msg) => { setToast(msg); };

  // Read time calculator
  const readTime = () => {
    const words = (post.body + " " + comments.map((c) => c.text).join(" ")).split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };

  // Sort + filter + tab
  const visibleComments = [...comments]
    .filter((c) => {
      // Tab filter
      if (activeTab === "Pinned") return c.pinned;
      if (activeTab === "Mine") return c.author === "You";
      return true;
    })
    .filter((c) => {
      if (!searchQuery) return true;
      return c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.id - a.id;
      if (sortBy === "oldest") return a.id - b.id;
      if (sortBy === "top") return b.likes - a.likes;
      if (sortBy === "pinned") return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      return 0;
    });

  // Handlers
  const handlePost = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 600));
    if (replyTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.id
            ? { ...c, replies: [...(c.replies || []), { id: Date.now(), author: "You", initials: "ME", color: "#a855f7", text: newComment.trim(), time: "just now" }] }
            : c
        )
      );
      showToast("↩️ Reply posted!");
    } else {
      setComments((prev) => [...prev, {
        id: Date.now(), author: "You", initials: "ME", color: "#a855f7",
        text: newComment.trim(), time: "just now", likes: 0, liked: false,
        bookmarked: false, reactions: {}, pinned: false, verified: false, replies: [],
      }]);
      showToast("💬 Comment posted!");
    }
    setNewComment("");
    setReplyTo(null);
    setPosting(false);
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.author} `);
    document.getElementById("commentTextarea")?.focus();
  };

  const cancelReply = () => { setReplyTo(null); setNewComment(""); };

  const startEditPost = () => {
    setEditPostTitle(post.title);
    setEditPostBody(post.body);
    setEditingPost(true);
  };

  const saveEditPost = () => {
    if (!editPostTitle.trim() || !editPostBody.trim()) return;
    setPost((p) => ({ ...p, title: editPostTitle.trim(), body: editPostBody.trim() }));
    setEditingPost(false);
    showToast("✅ Post updated");
  };

  const cancelEditPost = () => setEditingPost(false);

  const deletePost = () => {
    if (!confirm("Delete this post and all comments?")) return;
    setPost((p) => ({ ...p, deleted: true }));
    setComments([]);
    showToast("🗑️ Post deleted");
  };

  const toggleLike = (id) => {
    setComments((prev) =>
      prev.map((c) => c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c)
    );
  };

  const toggleBookmark = (id) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, bookmarked: !c.bookmarked } : c));
    const c = comments.find((x) => x.id === id);
    showToast(c?.bookmarked ? "Bookmark removed" : "🔖 Bookmarked!");
  };

  const addReaction = (commentId, emoji) => {
    setComments((prev) =>
      prev.map((c) => c.id === commentId ? { ...c, reactions: { ...c.reactions, [emoji]: (c.reactions[emoji] || 0) + 1 } } : c)
    );
  };

  const saveEditComment = (id, text) => {
    if (!text?.trim()) return;
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, text: text.trim() } : c));
    showToast("✅ Comment updated");
  };

  const deleteComment = (id) => {
    if (!confirm("Delete this comment?")) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (replyTo?.id === id) cancelReply();
    showToast("🗑️ Comment deleted");
  };

  const togglePin = (id) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
    const c = comments.find((x) => x.id === id);
    showToast(c?.pinned ? "Unpinned" : "📌 Comment pinned!");
  };

  const copyLink = (id) => {
    navigator.clipboard?.writeText(`${window.location.href}#comment-${id}`).catch(() => { });
    showToast("🔗 Link copied!");
  };

  const reportComment = () => showToast("🚩 Reported — thanks for your feedback");

  // ── Nested reply handlers ─────────────────────────────────────────────────
  const saveEditReply = (commentId, replyId, text) => {
    if (!text?.trim()) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: c.replies.map((r) => r.id === replyId ? { ...r, text: text.trim() } : r) }
          : c
      )
    );
    showToast("✅ Reply updated");
  };

  const handleDeleteReply = (commentId, reply) => {
    if (!confirm("Delete this reply?")) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: c.replies.filter((r) => r.id !== reply.id) }
          : c
      )
    );
    showToast("🗑️ Reply deleted");
  };

  const wrapText = (before, after) => {
    const ta = document.getElementById("commentTextarea");
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = newComment.substring(s, e) || "text";
    const updated = newComment.substring(0, s) + before + sel + after + newComment.substring(e);
    setNewComment(updated);
    setTimeout(() => { ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + sel.length; ta.focus(); }, 0);
  };

  // ── Styles helpers ──────────────────────────────────────────────────────────
  const card = {
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.12)"}`,
    borderRadius: "20px",
    boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.28)" : "0 8px 32px rgba(108,71,255,0.08)",
  };

  const ghostBtn = (isDanger = false, isEdit = false) => ({
    background: isDanger ? "rgba(220,38,38,0.1)" : isEdit ? "rgba(37,99,235,0.1)" : "transparent",
    border: `1px solid ${isDanger ? "rgba(220,38,38,0.25)" : isEdit ? "rgba(37,99,235,0.25)" : "rgba(108,71,255,0.18)"}`,
    borderRadius: "8px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: 600,
    color: isDanger ? "#ef4444" : isEdit ? "#3b82f6" : (isDark ? "#fff" : "#0f0a1e"),
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    transition: "background 0.15s, color 0.15s, transform 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .disc-root{font-family:'DM Sans',sans-serif;min-height:100vh;background:${isDark ? "#06060f" : "#f6f4ff"};position:relative}
        .disc-glow{position:fixed;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(108,71,255,0.07) 0%,transparent 70%);top:-200px;left:50%;transform:translateX(-50%);pointer-events:none;z-index:0}
        .disc-main{max-width:740px;margin:0 auto;padding:36px 20px;position:relative;z-index:1}
        .tab-btn{background:none;border:none;border-bottom:2px solid transparent;padding:8px 14px;font-size:13px;font-weight:500;cursor:pointer;color:${isDark ? "rgba(255,255,255,0.4)" : "rgba(15,10,30,0.4)"};transition:all 0.15s;font-family:'DM Sans',sans-serif}
        .tab-btn.active{color:#a78bfa;border-bottom-color:#a78bfa}
        .sort-select{
          background:${isDark ? "#2a2040" : "#ffffff"};
          border:1px solid ${isDark ? "rgba(167,139,250,0.35)" : "rgba(108,71,255,0.25)"};
          border-radius:8px;
          padding:5px 10px;
          font-size:12px;
          color:${isDark ? "#e2d9ff" : "#0f0a1e"};
          cursor:pointer;
          outline:none;
          font-family:'DM Sans',sans-serif;
        }
        .sort-select option{
          background:${isDark ? "#1e1530" : "#ffffff"};
          color:${isDark ? "#e2d9ff" : "#0f0a1e"};
        }
        .search-input{width:100%;background:${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)"};border:1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};border-radius:10px;padding:9px 14px 9px 36px;font-size:13px;color:${isDark ? "#fff" : "#0f0a1e"};outline:none;transition:border-color 0.2s;font-family:'DM Sans',sans-serif}
        .search-input:focus{border-color:rgba(108,71,255,0.4)}
        .search-input::placeholder{color:${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.3)"}}
        .compose-textarea{width:100%;min-height:80px;resize:none;background:${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.03)"};border:1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.12)"};border-radius:12px;padding:12px 14px;color:${isDark ? "#fff" : "#0f0a1e"};font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;box-sizing:border-box;line-height:1.6}
        .compose-textarea:focus{border-color:rgba(108,71,255,0.45);box-shadow:0 0 0 3px rgba(108,71,255,0.07)}
        .compose-textarea::placeholder{color:${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.25)"}}
        .tool-btn{background:none;border:none;cursor:pointer;padding:5px 7px;border-radius:6px;font-size:14px;color:${isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.4)"};transition:all 0.15s}
        .tool-btn:hover{background:${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.08)"};}
        .post-btn{padding:9px 20px;background:linear-gradient(135deg,#6c47ff,#a855f7);border:none;border-radius:10px;color:#fff;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all 0.2s}
        .post-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 20px rgba(108,71,255,0.35)}
        .post-btn:disabled{opacity:0.45;cursor:not-allowed;transform:none}
        .loader{width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
        .progress-bar-outer{height:3px;background:${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};border-radius:2px;margin-top:6px;overflow:hidden}
        .progress-bar-inner{height:100%;border-radius:2px;background:linear-gradient(90deg,#6c47ff,#a855f7);transition:width 0.15s}
      `}</style>

      <div className="disc-root">
        <div className="disc-glow" />
        <div className="disc-main">

          {/* ── Post Card ── */}
          {!post.deleted && (
            <div style={{ ...card, padding: "28px 30px", marginBottom: "24px", animation: "fadeUp 0.4s ease" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(108,71,255,0.1)", border: "1px solid rgba(108,71,255,0.2)",
                borderRadius: "100px", padding: "4px 12px", fontSize: "11px",
                fontWeight: 600, color: "#a78bfa", letterSpacing: "0.06em",
                textTransform: "uppercase", marginBottom: "14px",
              }}>
                {post.category}
              </div>
              {editingPost ? (
                <div style={{ marginBottom: "18px" }}>
                  <input
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    placeholder="Post title…"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      marginBottom: "10px", padding: "10px 14px",
                      borderRadius: "10px", border: "1px solid rgba(108,71,255,.3)",
                      background: isDark ? "rgba(108,71,255,.08)" : "rgba(108,71,255,.05)",
                      color: isDark ? "#fff" : "#0f0a1e",
                      fontFamily: "'Syne',sans-serif", fontSize: "17px", fontWeight: 700,
                      outline: "none",
                    }}
                  />
                  <textarea
                    value={editPostBody}
                    onChange={(e) => setEditPostBody(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "10px 14px", borderRadius: "10px",
                      border: "1px solid rgba(108,71,255,.3)",
                      background: isDark ? "rgba(108,71,255,.08)" : "rgba(108,71,255,.05)",
                      color: isDark ? "#fff" : "#0f0a1e",
                      fontFamily: "inherit", fontSize: "14px", lineHeight: 1.6,
                      resize: "vertical", outline: "none",
                    }}
                  />
                </div>
              ) : (
                <>
                  <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "24px", fontWeight: 800, color: isDark ? "#fff" : "#0f0a1e", marginBottom: "10px", lineHeight: 1.28 }}>
                    {post.title}
                  </h1>
                  <p style={{ fontSize: "15px", lineHeight: 1.7, color: isDark ? "rgba(255,255,255,0.62)" : "rgba(15,10,30,0.63)", marginBottom: "18px" }}>
                    {post.body}
                  </p>
                </>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", paddingTop: "14px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg,#6c47ff,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff" }}>AD</div>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: isDark ? "rgba(255,255,255,0.65)" : "rgba(15,10,30,0.65)" }}>Admin</span>
                </div>
                {!editingPost && [`💬 ${comments.length} comments`, `👀 124 views`, `🕐 3h ago`, `📖 ${readTime()}`].map((s) => (
                  <span key={s} style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)", display: "flex", alignItems: "center", gap: "4px" }}>{s}</span>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                  {editingPost ? (
                    <>
                      <button
                        style={ghostBtn(false, true)}
                        onClick={saveEditPost}
                        onMouseEnter={(ev) => { ev.currentTarget.style.background = "#2563eb"; ev.currentTarget.style.color = "#fff"; ev.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(ev) => { ev.currentTarget.style.background = "rgba(37,99,235,0.1)"; ev.currentTarget.style.color = "#3b82f6"; ev.currentTarget.style.transform = "none"; }}
                      >💾 Save</button>
                      <button
                        onClick={cancelEditPost}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                          color: isDark ? "rgba(255,255,255,0.5)" : "rgba(15,10,30,0.5)", fontFamily: "inherit",
                        }}
                      >Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        style={ghostBtn(false, true)}
                        onClick={startEditPost}
                        onMouseEnter={(ev) => { ev.currentTarget.style.background = "#2563eb"; ev.currentTarget.style.color = "#fff"; ev.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(ev) => { ev.currentTarget.style.background = "rgba(37,99,235,0.1)"; ev.currentTarget.style.color = "#3b82f6"; ev.currentTarget.style.transform = "none"; }}
                      >✏️ Edit</button>
                      <button
                        style={ghostBtn(true)}
                        onClick={deletePost}
                        onMouseEnter={(ev) => { ev.currentTarget.style.background = "#dc2626"; ev.currentTarget.style.color = "#fff"; ev.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(ev) => { ev.currentTarget.style.background = "rgba(220,38,38,0.1)"; ev.currentTarget.style.color = "#ef4444"; ev.currentTarget.style.transform = "none"; }}
                      >🗑️ Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Compose Box ── */}
          {!post.deleted && (
            <div style={{ ...card, padding: "18px 20px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg,#a855f7,#6c47ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff" }}>ME</div>
                <span style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.4)" }}>
                  {replyTo ? `Replying to ${replyTo.author}` : "Add your thoughts..."}
                </span>
              </div>

              {replyTo && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: isDark ? "rgba(108,71,255,0.1)" : "rgba(108,71,255,0.06)",
                  border: "1px solid rgba(108,71,255,0.2)", borderRadius: "8px",
                  padding: "7px 12px", marginBottom: "10px", fontSize: "12px",
                  color: isDark ? "rgba(255,255,255,0.55)" : "rgba(15,10,30,0.55)",
                }}>
                  <span>↩️ Replying to <strong style={{ color: "#a78bfa" }}>{replyTo.author}</strong></span>
                  <button onClick={cancelReply} style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,10,30,0.4)", fontSize: "16px", lineHeight: 1 }}>×</button>
                </div>
              )}

              {/* Formatting toolbar */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                {[["B", "**", "**", "Bold"], ["I", "_", "_", "Italic"], ["`", "`", "`", "Code"]].map(([label, b, a, title]) => (
                  <button key={label} title={title} className="tool-btn" onClick={() => wrapText(b, a)}
                    style={{ fontWeight: label === "B" ? 700 : label === "I" ? "normal" : undefined, fontStyle: label === "I" ? "italic" : undefined, fontFamily: label === "`" ? "monospace" : undefined }}
                  >{label}</button>
                ))}
              </div>

              <textarea
                id="commentTextarea"
                className="compose-textarea"
                placeholder={replyTo ? `Reply to ${replyTo.author}...` : "Share your perspective on this discussion..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
              />
              <div className="progress-bar-outer">
                <div className="progress-bar-inner" style={{ width: `${(newComment.length / 500) * 100}%` }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <span style={{ fontSize: "12px", color: newComment.length > 480 ? "#f59e0b" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.3)") }}>
                  {newComment.length}/500
                </span>
                <button className="post-btn" onClick={handlePost} disabled={posting || !newComment.trim()}>
                  {posting ? <span className="loader" /> : "💬"} Post Comment
                </button>
              </div>
            </div>
          )}

          {/* ── Comments Section ── */}
          {!post.deleted && (
            <div>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "16px", fontWeight: 700, color: isDark ? "#fff" : "#0f0a1e" }}>Comments</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 9px", background: "rgba(108,71,255,0.12)", color: "#a78bfa", borderRadius: "100px" }}>
                    {comments.length}
                  </span>
                </div>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="top">Top liked</option>
                  <option value="pinned">Pinned first</option>
                </select>
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Tabs — now functional */}
              <div style={{ display: "flex", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"}`, marginBottom: "18px" }}>
                {["All", "Pinned", "Mine"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >{tab}</button>
                ))}
              </div>

              {/* Comments list */}
              {visibleComments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.3)" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>
                    {searchQuery ? "🔍" : activeTab === "Pinned" ? "📌" : activeTab === "Mine" ? "👤" : "💬"}
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    {searchQuery
                      ? "No comments match your search"
                      : activeTab === "Pinned"
                      ? "No pinned comments yet"
                      : activeTab === "Mine"
                      ? "You haven't commented yet"
                      : "No comments yet — be the first!"}
                  </div>
                </div>
              ) : (
                visibleComments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    isDark={isDark}
                    searchQuery={searchQuery}
                    onLike={toggleLike}
                    onBookmark={toggleBookmark}
                    onReply={handleReply}
                    onEditSave={saveEditComment}
                    onDelete={deleteComment}
                    onAddReaction={addReaction}
                    onPin={togglePin}
                    onCopyLink={copyLink}
                    onReport={reportComment}
                    onEditReplySave={saveEditReply}
                    onDeleteReply={handleDeleteReply}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
};

export default Discussion;