import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const { isDark } = useTheme();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/posts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = posts
    .filter((p) => !search || (p.content || p.title || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "popular") return (b.likes?.length || 0) - (a.likes?.length || 0);
      return 0;
    });

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: ${isDark ? "#050508" : "#f8f7ff"};
          position: relative;
          overflow-x: hidden;
        }
        .dash-bg-orb-1 {
          position: fixed; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(108,71,255,0.09) 0%, transparent 70%);
          top: -250px; right: -250px; pointer-events: none; z-index: 0;
        }
        .dash-bg-orb-2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%);
          bottom: -200px; left: -150px; pointer-events: none; z-index: 0;
        }

        .dash-main { max-width: 760px; margin: 0 auto; padding: 32px 24px; position: relative; z-index: 1; }

        .dash-hero { margin-bottom: 28px; animation: fadeUp 0.5s ease forwards; }
        .dash-greeting {
          font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          color: #a78bfa; margin-bottom: 6px;
        }
        .dash-title {
          font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800;
          color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 20px;
        }

        .dash-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)"};
          backdrop-filter: blur(16px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 16px; padding: 18px 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,71,255,0.12); }
        .stat-card-icon { font-size: 22px; margin-bottom: 10px; }
        .stat-card-num {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
          color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 2px;
        }
        .stat-card-lbl { font-size: 12px; color: ${isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.4)"}; }

        .dash-controls {
          display: flex; gap: 10px; align-items: center; margin-bottom: 24px; flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1; min-width: 200px; position: relative;
        }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(15,10,30,0.25)"}; pointer-events: none; }
        .search-input {
          width: 100%; padding: 11px 14px 11px 42px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.12)"};
          border-radius: 12px; color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .search-input::placeholder { color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.3)"}; }
        .search-input:focus { border-color: rgba(108,71,255,0.45); box-shadow: 0 0 0 3px rgba(108,71,255,0.1); }

        .sort-select {
          padding: 11px 14px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.12)"};
          border-radius: 12px; color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
          cursor: pointer; transition: border-color 0.2s;
        }
        .sort-select:focus { border-color: rgba(108,71,255,0.45); }

        .results-count {
          font-size: 13px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.4)"};
          margin-bottom: 16px;
        }
        .results-count span { color: #a78bfa; font-weight: 600; }

        .posts-list { display: flex; flex-direction: column; gap: 14px; }

        .empty-state {
          text-align: center; padding: 72px 20px;
          background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)"};
          border: 1px dashed ${isDark ? "rgba(108,71,255,0.2)" : "rgba(108,71,255,0.2)"};
          border-radius: 24px; animation: fadeUp 0.5s ease forwards;
        }
        .empty-emoji { font-size: 52px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: ${isDark ? "#fff" : "#0f0a1e"}; margin-bottom: 8px; }
        .empty-sub { font-size: 14px; color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(15,10,30,0.4)"}; }

        .skeleton-post {
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"};
          border-radius: 20px; padding: 20px 22px;
        }
        .skel { background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}; border-radius: 8px; animation: shimmer 1.5s infinite; }
      `}</style>

      <div className="dash-root">
        <div className="dash-bg-orb-1" />
        <div className="dash-bg-orb-2" />

        <div className="dash-main">
          <div className="dash-hero">
            <div className="dash-greeting">📡 Community Feed</div>
            <h1 className="dash-title">What's happening?</h1>

            <div className="dash-stats">
              <div className="stat-card">
                <div className="stat-card-icon">📝</div>
                <div className="stat-card-num">{posts.length}</div>
                <div className="stat-card-lbl">Total Posts</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">❤️</div>
                <div className="stat-card-num">{totalLikes}</div>
                <div className="stat-card-lbl">Total Likes</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">🔥</div>
                <div className="stat-card-num">{posts.filter(p => p.likes?.length > 2).length}</div>
                <div className="stat-card-lbl">Trending</div>
              </div>
            </div>
          </div>

          <CreatePost refresh={fetchPosts} />

          <div className="dash-controls" style={{ marginTop: 24 }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              Showing <span>{filtered.length}</span> of <span>{posts.length}</span> posts
              {search && <> for "<span>{search}</span>"</>}
            </p>
          )}

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
              <p className="empty-sub">{search ? `No posts match "${search}". Try a different search.` : "Be the first one to share something!"}</p>
            </div>
          ) : (
            <div className="posts-list">
              {filtered.map((post) => (
                <PostCard key={post._id} post={post} refresh={fetchPosts} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}