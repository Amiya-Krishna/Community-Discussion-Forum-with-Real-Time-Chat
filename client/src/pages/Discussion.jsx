import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const REACTIONS = ["❤️", "🔥", "👍", "😂", "😮"];
const DISCUSSION_POST_KEY = "discussion_post";
const DISCUSSION_COMMENTS_KEY = "discussion_comments";

const DEFAULT_POST = {
  category: "💡 Discussion",
  title: "What's the future of AI in software development?",
  body: "Artificial intelligence is rapidly transforming the way we write, test, and deploy code. From intelligent autocomplete to full feature generation — where do you think this is headed in the next 5 years?",
  deleted: false,
};

const MOCK_COMMENTS = [
  { id: 1, author: "Aryan K.", initials: "AK", color: "#6c47ff", text: "This is a really interesting topic! I've been thinking about this for a while.", time: "2h ago", likes: 12, liked: false, reactions: { "❤️": 3, "🔥": 2 } },
  { id: 2, author: "Priya S.", initials: "PS", color: "#ec4899", text: "Great post! Would love to hear more thoughts on this from the community.", time: "1h ago", likes: 7, liked: false, reactions: { "👍": 5 } },
  { id: 3, author: "Rohan M.", initials: "RM", color: "#10b981", text: "Totally agree with the points raised here. Very well written!", time: "45m ago", likes: 4, liked: false, reactions: {} },
];

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
  const [reactionPicker, setReactionPicker] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    localStorage.setItem(DISCUSSION_POST_KEY, JSON.stringify(post));
  }, [post]);

  useEffect(() => {
    localStorage.setItem(DISCUSSION_COMMENTS_KEY, JSON.stringify(comments));
  }, [comments]);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 600));
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: "You",
        initials: "ME",
        color: "#a855f7",
        text: replyTo ? `↩️ @${replyTo.author} ${newComment.trim()}` : newComment.trim(),
        time: "just now",
        likes: 0,
        liked: false,
        reactions: {},
        replyTo: replyTo?.id || null,
      },
    ]);
    setNewComment("");
    setReplyTo(null);
    setPosting(false);
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setNewComment((prev) => prev || `@${comment.author} `);
  };

  const editPost = () => {
    const title = prompt("Edit discussion title", post.title);
    if (title === null || !title.trim()) return;

    const body = prompt("Edit discussion post", post.body);
    if (body === null || !body.trim()) return;

    setPost((prev) => ({ ...prev, title: title.trim(), body: body.trim() }));
  };

  const deletePost = () => {
    if (!confirm("Delete this discussion post?")) return;
    setPost((prev) => ({ ...prev, deleted: true }));
    setComments([]);
    setReplyTo(null);
    setNewComment("");
  };

  const editComment = (comment) => {
    const text = prompt("Edit comment", comment.text);
    if (text === null || !text.trim()) return;

    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, text: text.trim() } : c))
    );
  };

  const deleteComment = (id) => {
    if (!confirm("Delete this comment?")) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (replyTo?.id === id) {
      setReplyTo(null);
      setNewComment("");
    }
  };

  const toggleLike = (id) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      )
    );
  };

  const addReaction = (commentId, emoji) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, reactions: { ...c.reactions, [emoji]: (c.reactions[emoji] || 0) + 1 } }
          : c
      )
    );
    setReactionPicker(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .disc-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: ${isDark ? "#050508" : "#f8f7ff"};
          position: relative;
        }
        .disc-bg { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(108,71,255,0.08) 0%, transparent 70%); top: -200px; left: 50%; transform: translateX(-50%); pointer-events: none; z-index: 0; }

        .disc-main { max-width: 720px; margin: 0 auto; padding: 36px 24px; position: relative; z-index: 1; }

        .disc-post-card {
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)"};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.12)"};
          border-radius: 24px; padding: 28px 32px; margin-bottom: 32px;
          box-shadow: ${isDark ? "0 20px 60px rgba(0,0,0,0.3)" : "0 10px 40px rgba(108,71,255,0.08)"};
          animation: fadeUp 0.4s ease forwards;
        }
        .disc-category {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(108,71,255,0.12); border: 1px solid rgba(108,71,255,0.22);
          border-radius: 100px; padding: 5px 12px;
          font-size: 12px; font-weight: 600; color: #a78bfa;
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .disc-title {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
          color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 12px; line-height: 1.25;
        }
        .disc-body {
          font-size: 15px; line-height: 1.7;
          color: ${isDark ? "rgba(255,255,255,0.65)" : "rgba(15,10,30,0.65)"}; margin-bottom: 20px;
        }
        .disc-meta {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          padding-top: 16px;
          border-top: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"};
        }
        .disc-author-row { display: flex; align-items: center; gap: 8px; }
        .disc-author-av {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #fff;
        }
        .disc-author-name { font-size: 13px; font-weight: 500; color: ${isDark ? "rgba(255,255,255,0.7)" : "rgba(15,10,30,0.7)"}; }
        .disc-stat {
          font-size: 13px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.35)"};
          display: flex; align-items: center; gap: 5px;
        }

        .comments-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;
        }
        .comments-title {
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          display: flex; align-items: center; gap: 10px;
        }
        .comments-count {
          font-size: 12px; font-weight: 700; padding: 2px 9px;
          background: rgba(108,71,255,0.15); color: #a78bfa;
          border-radius: 100px;
        }

        .comment-item {
          display: flex; gap: 14px; margin-bottom: 16px;
          animation: fadeUp 0.35s ease forwards;
        }
        .comment-av {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #fff;
        }
        .comment-bubble {
          flex: 1;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 0 16px 16px 16px; padding: 14px 16px;
          transition: border-color 0.2s;
        }
        .comment-bubble:hover { border-color: rgba(108,71,255,0.2); }
        .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .comment-author { font-size: 13px; font-weight: 600; color: ${isDark ? "#fff" : "#0f0a1e"}; }
        .comment-time { font-size: 11px; color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(15,10,30,0.3)"}; }
        .comment-text { font-size: 14px; color: ${isDark ? "rgba(255,255,255,0.75)" : "rgba(15,10,30,0.7)"}; line-height: 1.55; margin-bottom: 10px; }
        .comment-actions { display: flex; align-items: center; gap: 8px; }
        .action-btn {
          background: none; border: none; cursor: pointer; padding: 4px 10px;
          border-radius: 8px; font-size: 13px; font-weight: 500;
          color: ${isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.4)"};
          transition: all 0.15s; display: flex; align-items: center; gap: 5px;
        }
        .action-btn:hover { background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.07)"}; color: #a78bfa; }
        .action-btn.liked { color: #f87171; }
        .reaction-chip {
          padding: 3px 8px; border-radius: 100px; font-size: 12px;
          background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.06)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.1)"};
          color: ${isDark ? "rgba(255,255,255,0.6)" : "rgba(15,10,30,0.5)"};
          cursor: pointer; transition: all 0.15s;
        }
        .reaction-chip:hover { background: rgba(108,71,255,0.12); border-color: rgba(108,71,255,0.25); }

        .reaction-picker {
          position: relative; display: inline-block;
        }
        .reaction-dropdown {
          position: absolute; bottom: calc(100% + 8px); left: 0;
          background: ${isDark ? "rgba(20,17,30,0.95)" : "rgba(255,255,255,0.97)"};
          backdrop-filter: blur(16px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.15)"};
          border-radius: 14px; padding: 8px;
          display: flex; gap: 4px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          z-index: 10; animation: popIn 0.2s ease forwards;
        }
        .reaction-opt {
          background: none; border: none; font-size: 20px; cursor: pointer;
          padding: 6px 8px; border-radius: 8px; transition: all 0.15s;
        }
        .reaction-opt:hover { transform: scale(1.3); background: rgba(108,71,255,0.1); }

        .compose-box {
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)"};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.12)"};
          border-radius: 20px; padding: 20px; margin-bottom: 28px;
        }
        .compose-label { font-size: 13px; font-weight: 500; color: ${isDark ? "rgba(255,255,255,0.4)" : "rgba(15,10,30,0.45)"}; margin-bottom: 10px; }
        .compose-textarea {
          width: 100%; min-height: 80px; resize: none;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.03)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 12px; padding: 12px 14px;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .compose-textarea::placeholder { color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.25)"}; }
        .compose-textarea:focus { border-color: rgba(108,71,255,0.45); box-shadow: 0 0 0 3px rgba(108,71,255,0.08); }
        .compose-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .char-count { font-size: 12px; color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.3)"}; }
        .btn-post {
          padding: 10px 22px;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 7px;
        }
        .btn-post:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(108,71,255,0.4); }
        .btn-post:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .loader { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="disc-root">
        <div className="disc-bg" />

        <div className="disc-main">
          {/* Post Card */}
          {!post.deleted && <div className="disc-post-card">
            <div className="disc-category">{post.category}</div>
            <h1 className="disc-title">{post.title}</h1>
            <p className="disc-body">{post.body}</p>
            <div className="disc-meta">
              <div className="disc-author-row">
                <div className="disc-author-av">AD</div>
                <span className="disc-author-name">Admin</span>
              </div>
              <div className="disc-stat">💬 {comments.length} comments</div>
              <div className="disc-stat">👀 124 views</div>
              <div className="disc-stat">🕐 3h ago</div>
              <button className="action-btn" onClick={editPost}>✏️ Edit</button>
              <button className="action-btn" onClick={deletePost}>🗑️ Delete</button>
            </div>
          </div>}

          {/* Compose */}
          {!post.deleted && <div className="compose-box">
            <div className="compose-label">✏️ Add your thoughts</div>
            <textarea
              className="compose-textarea"
              placeholder="Share your perspective on this discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
            />
            <div className="compose-footer">
              <span className="char-count">{newComment.length}/500</span>
              <button
                className="btn-post"
                onClick={handlePost}
                disabled={posting || !newComment.trim()}
              >
                {posting ? <span className="loader" /> : "💬"} Post Comment
              </button>
            </div>
          </div>}

          {/* Comments */}
          {!post.deleted && <div>
            <div className="comments-header">
              <div className="comments-title">
                Comments
                <span className="comments-count">{comments.length}</span>
              </div>
            </div>

            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <div className="comment-av" style={{ background: c.color }}>{c.initials}</div>
                <div className="comment-bubble">
                  <div className="comment-header">
                    <span className="comment-author">{c.author}</span>
                    <span className="comment-time">{c.time}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-actions">
                    <button className={`action-btn ${c.liked ? "liked" : ""}`} onClick={() => toggleLike(c.id)}>
                      {c.liked ? "❤️" : "🤍"} {c.likes}
                    </button>
                    <button className="action-btn" onClick={() => handleReply(c)}>↩️ Reply</button>
                    <button className="action-btn" onClick={() => editComment(c)}>✏️ Edit</button>
                    <button className="action-btn" onClick={() => deleteComment(c.id)}>🗑️ Delete</button>

                    {Object.entries(c.reactions).map(([emoji, count]) => (
                      <span key={emoji} className="reaction-chip">{emoji} {count}</span>
                    ))}

                    <div className="reaction-picker">
                      <button className="action-btn" onClick={() => setReactionPicker(reactionPicker === c.id ? null : c.id)}>
                        😊 React
                      </button>
                      {reactionPicker === c.id && (
                        <div className="reaction-dropdown">
                          {REACTIONS.map((emoji) => (
                            <button key={emoji} className="reaction-opt" onClick={() => addReaction(c.id, emoji)}>
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </>
  );
};

export default Discussion;
