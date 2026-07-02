import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reactions: [reactionSchema],
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String, // rich text stored as sanitized HTML
  image: { type: String, default: null }, // uploaded image URL
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // Legacy simple-like array — kept in sync with a "like" reaction for backward compatibility
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reactions: [reactionSchema],
  comments: [commentSchema]
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);
