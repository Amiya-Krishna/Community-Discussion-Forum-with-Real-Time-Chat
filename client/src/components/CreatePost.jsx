import { useState } from "react";
import axios from "axios";

export default function CreatePost({ refresh }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    await axios.post("/api/posts",
      { title, content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setTitle("");
    setContent("");
    refresh();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
      <input
        placeholder="Title"
        className="w-full mb-2 p-2 rounded bg-black/30 text-white"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="What's on your mind?"
        className="w-full p-2 rounded bg-black/30 text-white"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="mt-3 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
      >
        Post 🚀
      </button>
    </div>
  );
}