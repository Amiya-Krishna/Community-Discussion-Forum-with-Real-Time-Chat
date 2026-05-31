import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const { isDark } = useTheme();

  const fetchPosts = async () => {
    const res = await axios.get("/api/posts", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    setPosts(res.data);
  };

  useEffect(() => {
    const loadPosts = async () => {
      await fetchPosts();
    };

    loadPosts();
  }, []);

  return (
    <div className={`${isDark ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gradient-to-br from-gray-50 to-gray-100"} min-h-screen`}>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <CreatePost refresh={fetchPosts} />

        <div className="mt-6 space-y-4">
          {posts.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <p className="text-lg">No posts yet. Be the first to create one!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post._id} post={post} refresh={fetchPosts} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}