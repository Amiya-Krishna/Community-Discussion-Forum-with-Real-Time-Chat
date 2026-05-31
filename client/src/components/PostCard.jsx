import axios from "axios";
import CommentBox from "./CommentBox";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post, refresh }) {
  const { user } = useAuth();

  const likePost = async () => {
    await axios.put(`/api/posts/${post._id}/like`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    refresh();
  };

  const removePost = async () => {
    if (!confirm("Delete this post?")) return;
    await axios.delete(`/api/posts/${post._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    refresh();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg hover:scale-[1.02] transition">
      <h2 className="text-xl font-bold text-white">{post.title}</h2>
      <p className="text-gray-300 mt-2">{post.content}</p>

      <div className="flex items-center gap-4 mt-3">
        <button onClick={likePost} className="text-pink-400">
          ❤️ {post.likes.length}
        </button>
        {(user && (user._id === (post.author?._id || post.author) || user.isAdmin)) && (
          <button onClick={removePost} className="text-red-400">🗑️ Delete</button>
        )}
      </div>

      <CommentBox post={post} refresh={refresh} />
    </div>
  );
}