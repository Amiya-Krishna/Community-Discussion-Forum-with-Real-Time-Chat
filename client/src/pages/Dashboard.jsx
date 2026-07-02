import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { useTheme } from "../context/ThemeContext";

// ── tiny relative-time helper (WhatsApp / Instagram style) ──────────────────
export function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  // older than a week → show full date
  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const PAGE_SIZE = 8;

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("newest");
  const { isDark } = useTheme();
  const sentinelRef = useRef(null);

  // Debounce the search box before it triggers a server request
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchPage = useCallback(async (pageNum, { replace } = {}) => {
    const isFirstPage = pageNum === 1;
    isFirstPage ? setLoading(true) : setLoadingMore(true);
    try {
      const res = await axios.get("/api/posts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: {
          page: pageNum,
          limit: PAGE_SIZE,
          search: search || undefined,
          sort: sort === "oldest" ? "oldest" : "newest",
        },
      });
      const { posts: newPosts = [], hasMore: more = false, total: totalCount = 0 } = res.data || {};
      setPosts((prev) => (replace ? newPosts : [...prev, ...newPosts]));
      setHasMore(more);
      setPage(pageNum);
      if (typeof totalCount === "number") setTotal(totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, sort]);

  // Reset to page 1 whenever search or sort changes (or a mutation happened)
  const refresh = useCallback(() => fetchPage(1, { replace: true }), [fetchPage]);

  useEffect(() => { refresh(); }, [refresh]);

  // Infinite scroll: observe a sentinel element near the bottom of the list
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchPage(page + 1);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchPage]);

  // "Popular" sorts only the posts already loaded (client-side, by total reactions)
  const filtered = sort === "popular"
    ? [...posts].sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))
    : posts;

  const safePosts = Array.isArray(posts) ? posts : [];

  const totalLikes = safePosts.reduce((sum, p) => sum + (p.reactions?.length ?? p.likes?.length ?? 0), 0);
  const trendingCount = posts.filter((p) => (p.reactions?.length || 0) > 2).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0%,100%{ opacity:.5 } 50%{ opacity:1 } }

        /* ── root ──────────────────────────────────────────────────────────── */
        .dash-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: ${isDark ? "#050508" : "#f0eeff"};
          position: relative;
          overflow-x: hidden;
        }
        .dash-bg-orb-1 {
          position:fixed; width:700px; height:700px; border-radius:50%;
          background:radial-gradient(circle,rgba(108,71,255,.12) 0%,transparent 70%);
          top:-250px; right:-250px; pointer-events:none; z-index:0;
        }
        .dash-bg-orb-2 {
          position:fixed; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(0,229,255,.08) 0%,transparent 70%);
          bottom:-200px; left:-150px; pointer-events:none; z-index:0;
        }

        .dash-main { max-width:760px; margin:0 auto; padding:32px 24px; position:relative; z-index:1; }

        /* ── hero ──────────────────────────────────────────────────────────── */
        .dash-hero { margin-bottom:28px; animation:fadeUp .5s ease forwards; }
        .dash-greeting {
          font-size:13px; font-weight:500; letter-spacing:.08em; text-transform:uppercase;
          color:#a78bfa; margin-bottom:6px;
        }
        .dash-title {
          font-family:'Syne',sans-serif; font-size:32px; font-weight:800;
          color:${isDark ? "#fff" : "#0f0a1e"}; margin-bottom:20px;
        }

        /* ── stats — FIX: explicit dark/light text so it never clashes ─────── */
        .dash-stats {
          display:grid; grid-template-columns:repeat(3,1fr); gap:12px;
          margin-bottom:28px;
        }
        .stat-card {
          background:${isDark
            ? "linear-gradient(135deg,rgba(108,71,255,.22) 0%,rgba(255,255,255,.06) 100%)"
            : "linear-gradient(135deg,#6c47ff 0%,#8b5cf6 100%)"};
          backdrop-filter:blur(16px);
          border:1px solid ${isDark ? "rgba(108,71,255,.35)" : "rgba(108,71,255,.25)"};
          border-radius:16px; padding:18px 20px;
          transition:transform .2s,box-shadow .2s;
        }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(108,71,255,.28); }
        .stat-card-icon  { font-size:22px; margin-bottom:10px; }
        /* ↓ always WHITE text inside the coloured stat cards */
        .stat-card-num   { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; color:#fff; margin-bottom:2px; }
        .stat-card-lbl   { font-size:12px; color:rgba(255,255,255,.7); }

        /* ── controls ──────────────────────────────────────────────────────── */
        .dash-controls { display:flex; gap:10px; align-items:center; margin-bottom:24px; flex-wrap:wrap; }
        .search-wrap   { flex:1; min-width:200px; position:relative; }
        .search-icon   {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          font-size:16px;
          color:${isDark ? "rgba(255,255,255,.25)" : "rgba(15,10,30,.3)"};
          pointer-events:none;
        }
        .search-input {
          width:100%; padding:11px 14px 11px 42px;
          background:${isDark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.9)"};
          border:1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(108,71,255,.15)"};
          border-radius:12px; color:${isDark ? "#fff" : "#0f0a1e"};
          font-family:'DM Sans',sans-serif; font-size:14px;
          outline:none; transition:all .2s; box-sizing:border-box;
        }
        .search-input::placeholder { color:${isDark ? "rgba(255,255,255,.22)" : "rgba(15,10,30,.3)"}; }
        .search-input:focus { border-color:rgba(108,71,255,.45); box-shadow:0 0 0 3px rgba(108,71,255,.1); }

        .sort-select {
          padding:11px 14px;
          background:${isDark ? "rgba(255,255,255,.05)" : "rgba(255, 255, 255, 0.9)"};
          border:1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(108,71,255,.15)"};
          border-radius:12px; color:${isDark ? "#e644b8" : "#0f0a1e"};
          font-family:'DM Sans',sans-serif; font-size:14px;
          outline:none; cursor:pointer; transition:border-color .2s;
        }
        .sort-select:focus { border-color:rgba(108,71,255,.45); }

        /* ── misc ──────────────────────────────────────────────────────────── */
        .results-count { font-size:13px; color:${isDark ? "rgba(255,255,255,.3)" : "rgba(15,10,30,.45)"}; margin-bottom:16px; }
        .results-count span { color:#a78bfa; font-weight:600; }

        .posts-list { display:flex; flex-direction:column; gap:14px; }

        .empty-state {
          text-align:center; padding:72px 20px;
          background:${isDark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.8)"};
          border:1px dashed rgba(108,71,255,.22); border-radius:24px;
          animation:fadeUp .5s ease forwards;
        }
        .empty-emoji { font-size:52px; margin-bottom:16px; }
        .empty-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; color:${isDark ? "#fff" : "#0f0a1e"}; margin-bottom:8px; }
        .empty-sub   { font-size:14px; color:${isDark ? "rgba(255,255,255,.3)" : "rgba(15,10,30,.4)"}; }

        .skeleton-post {
          background:${isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.85)"};
          border:1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(108,71,255,.08)"};
          border-radius:20px; padding:20px 22px;
        }
        .skel { background:${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}; border-radius:8px; animation:shimmer 1.5s infinite; }

        /* ══════════════════════════════════════════════════════════════════════
           POST CARD  — title, action buttons, timestamp, share
        ══════════════════════════════════════════════════════════════════════ */
        .post-card {
          background:${isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.95)"};
          border:1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(108,71,255,.1)"};
          border-radius:20px; padding:20px 22px;
          animation:fadeUp .4s ease forwards;
          transition:box-shadow .2s;
        }
        .post-card:hover { box-shadow:0 6px 28px rgba(108,71,255,.1); }

        /* header row */
        .post-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:12px; }
        .post-avatar {
          width:40px; height:40px; border-radius:50%;
          background:linear-gradient(135deg,#6c47ff,#a78bfa);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:700; color:#fff; flex-shrink:0;
        }
        .post-meta    { flex:1; }
        .post-author  { font-weight:600; font-size:14px; color:${isDark ? "#fff" : "#0f0a1e"}; }
        .post-time    { font-size:12px; color:${isDark ? "rgba(255,255,255,.35)" : "rgba(15,10,30,.4)"}; margin-top:2px; }

        /* post title */
        .post-title {
          font-family:'Syne',sans-serif; font-size:17px; font-weight:700;
          color:${isDark ? "#e9e4ff" : "#0f0a1e"};
          margin-bottom:6px; line-height:1.35;
        }

        /* body */
        .post-body { font-size:14px; line-height:1.6; color:${isDark ? "rgba(255,255,255,.75)" : "rgba(15,10,30,.75)"}; margin-bottom:14px; }

        /* action bar */
        .post-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

        .btn-like {
          display:flex; align-items:center; gap:5px;
          padding:7px 14px; border-radius:10px; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          background:${isDark ? "rgba(255,255,255,.07)" : "rgba(108,71,255,.08)"};
          color:${isDark ? "rgba(255,255,255,.7)" : "#4b3fa0"};
          transition:all .18s;
        }
        .btn-like:hover { background:rgba(239,68,68,.12); color:#ef4444; }
        .btn-like.liked  { background:rgba(239,68,68,.15); color:#ef4444; }

        /* EDIT — blue bg, white text */
        .btn-edit {
          display:flex; align-items:center; gap:5px;
          padding:7px 14px; border-radius:10px; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          background:#2563eb; color:#fff;
          transition:background .18s, transform .15s;
        }
        .btn-edit:hover { background:#1d4ed8; transform:translateY(-1px); }

        /* DELETE — red bg, white text */
        .btn-delete {
          display:flex; align-items:center; gap:5px;
          padding:7px 14px; border-radius:10px; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          background:#dc2626; color:#fff;
          transition:background .18s, transform .15s;
        }
        .btn-delete:hover { background:#b91c1c; transform:translateY(-1px); }

        /* SHARE — ghost style */
        .btn-share {
          display:flex; align-items:center; gap:5px;
          padding:7px 14px; border-radius:10px; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          background:${isDark ? "rgba(255,255,255,.07)" : "rgba(108,71,255,.08)"};
          color:${isDark ? "rgba(255,255,255,.7)" : "#4b3fa0"};
          transition:all .18s; margin-left:auto;
        }
        .btn-share:hover { background:rgba(108,71,255,.18); color:#6c47ff; }

        /* share toast */
        .share-toast {
          position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
          background:#6c47ff; color:#fff;
          padding:10px 22px; border-radius:12px; font-size:14px; font-weight:500;
          z-index:9999; animation:fadeUp .3s ease;
          box-shadow:0 6px 24px rgba(108,71,255,.4);
        }

        /* post image */
        .post-image-wrap { margin-bottom: 14px; }
        .post-image {
          max-width: 100%; max-height: 420px; border-radius: 14px;
          border: 1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(108,71,255,.1)"};
          display: block; object-fit: cover;
        }

        /* mentions */
        .mention-chip {
          color: #a78bfa; font-weight: 600; background: rgba(108,71,255,0.14);
          padding: 0 4px; border-radius: 4px;
        }

        /* reactions */
        .reaction-wrap { position: relative; display: inline-block; }
        .reaction-summary { margin: 0 2px; }
        .reaction-picker {
          position: absolute; bottom: calc(100% + 8px); left: 0;
          display: flex; gap: 4px; padding: 6px 8px; border-radius: 100px;
          background: ${isDark ? "#15121f" : "#fff"};
          border: 1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(108,71,255,.15)"};
          box-shadow: 0 10px 28px rgba(0,0,0,.35);
          z-index: 15; animation: popIn .15s ease forwards;
        }
        @keyframes popIn { from { opacity:0; transform: scale(.85) translateY(4px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .reaction-picker-item {
          font-size: 19px; cursor: pointer; padding: 4px 6px; border-radius: 50%;
          transition: transform .12s;
        }
        .reaction-picker-item:hover { transform: scale(1.3); }
        .reaction-picker-item.active { background: rgba(108,71,255,.18); }

        /* infinite scroll sentinel + end message */
        .load-more-sentinel { height: 1px; }
        .load-more-spinner { display: flex; justify-content: center; padding: 24px 0; }
        .end-of-feed { text-align: center; padding: 24px 0; font-size: 13px; color: ${isDark ? "rgba(255,255,255,.25)" : "rgba(15,10,30,.35)"}; }

        /* ══ COMMENTS ══════════════════════════════════════════════════════════ */
        .comments-section { margin-top:14px; border-top:1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(108,71,255,.1)"}; padding-top:14px; }

        .comment-item {
          display:flex; gap:10px; margin-bottom:12px;
        }
        .comment-avatar {
          width:32px; height:32px; border-radius:50%;
          background:linear-gradient(135deg,#a78bfa,#6c47ff);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:700; color:#fff; flex-shrink:0;
        }
        .comment-bubble {
          background:${isDark ? "rgba(255,255,255,.06)" : "rgba(108,71,255,.07)"};
          border-radius:0 14px 14px 14px;
          padding:10px 14px; flex:1;
        }
        .comment-author { font-size:13px; font-weight:600; color:${isDark ? "#e2d9ff" : "#0f0a1e"}; margin-bottom:2px; }
        .comment-text   { font-size:13px; color:${isDark ? "rgba(255,255,255,.7)" : "rgba(15,10,30,.75)"}; line-height:1.5; }
        .comment-footer { display:flex; align-items:center; gap:8px; margin-top:6px; }
        .comment-time   { font-size:11px; color:${isDark ? "rgba(255,255,255,.3)" : "rgba(15,10,30,.38)"}; }

        /* comment action btns — same red/blue pattern, smaller */
        .btn-comment-edit {
          padding:3px 10px; border-radius:8px; border:none; cursor:pointer;
          font-size:11px; font-weight:500;
          background:#2563eb; color:#fff; transition:background .15s;
        }
        .btn-comment-edit:hover { background:#1d4ed8; }
        .btn-comment-delete {
          padding:3px 10px; border-radius:8px; border:none; cursor:pointer;
          font-size:11px; font-weight:500;
          background:#dc2626; color:#fff; transition:background .15s;
        }
        .btn-comment-delete:hover { background:#b91c1c; }
      `}</style>

      <div className="dash-root">
        <div className="dash-bg-orb-1" />
        <div className="dash-bg-orb-2" />

        <div className="dash-main">
          {/* ── Hero ── */}
          <div className="dash-hero">
            <div className="dash-greeting">📡 Community Feed</div>
            <h1 className="dash-title">What's happening?</h1>

            {/* Stats — always-white text on coloured cards, no more clash */}
            <div className="dash-stats">
              <div className="stat-card">
                <div className="stat-card-icon">📝</div>
                <div className="stat-card-num">{total}</div>
                <div className="stat-card-lbl">Total Posts</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">❤️</div>
                <div className="stat-card-num">{totalLikes}</div>
                <div className="stat-card-lbl">Total Likes</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">🔥</div>
                <div className="stat-card-num">{trendingCount}</div>
                <div className="stat-card-lbl">Trending</div>
              </div>
            </div>
          </div>

          <CreatePost refresh={refresh} />

          {/* ── Controls ── */}
          <div className="dash-controls" style={{ marginTop: 24 }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search posts…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">✦ Newest</option>
              <option value="oldest">⏳ Oldest</option>
              <option value="popular">🔥 Popular</option>
            </select>
          </div>

          {!loading && (
            <p className="results-count">
              Showing <span>{filtered.length}</span> posts
              {search && <> for "<span>{search}</span>"</>}
            </p>
          )}

          {/* ── Post list ── */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-post" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                    <div className="skel" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                    <div style={{ flex: 1 }}>
                      <div className="skel" style={{ width: "40%", height: 12, marginBottom: 8 }} />
                      <div className="skel" style={{ width: "25%", height: 10 }} />
                    </div>
                  </div>
                  <div className="skel" style={{ width: "100%", height: 12, marginBottom: 8 }} />
                  <div className="skel" style={{ width: "80%", height: 12 }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">{search ? "🔍" : "✨"}</div>
              <div className="empty-title">{search ? "No results found" : "No posts yet"}</div>
              <p className="empty-sub">
                {search
                  ? `No posts match "${search}". Try a different search.`
                  : "Be the first one to share something!"}
              </p>
            </div>
          ) : (
            <>
              <div className="posts-list">
                {filtered.map((post) => (
                  <PostCard key={post._id} post={post} refresh={refresh} />
                ))}
              </div>

              <div ref={sentinelRef} className="load-more-sentinel" />

              {loadingMore && (
                <div className="load-more-spinner">
                  <div className="skel" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                </div>
              )}

              {!hasMore && !loadingMore && posts.length > 0 && (
                <div className="end-of-feed">You're all caught up ✨</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}