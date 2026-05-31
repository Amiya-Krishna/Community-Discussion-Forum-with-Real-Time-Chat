import { useState } from "react";
import axios from "axios";

export default function CommentBox({ post, refresh }) {
  const [text, setText] = useState("");

  const addComment = async () => {
    await axios.post(`/api/posts/${post._id}/comment`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    setText("");
    refresh();
  };

  return (
    <div className="mt-4">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-2 rounded bg-black/30 text-white"
      />

      <button
        onClick={addComment}
        className="mt-2 px-3 py-1 bg-blue-600 rounded"
      >
        Comment
      </button>

      <div className="mt-3 space-y-1">
        {post.comments.map((c, i) => (
          <p key={i} className="text-sm text-gray-300">
            💬 {c.text}
          </p>
        ))}
      </div>
    </div>
  );
}