import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  toggleLike,
  toggleReaction,
  toggleCommentReaction,
  addComment,
  deleteComment,
  deletePost,
  editPost,
  editComment
} from "../controllers/postController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", protect, getPosts);
router.get("/:id", protect, getPost);

// Reactions (multi-emoji). /like kept for backward compatibility.
router.put("/:id/like", protect, toggleLike);
router.put("/:id/react", protect, toggleReaction);

router.post("/:id/comment", protect, addComment);
router.put("/:id", protect, editPost);

router.put("/:postId/comments/:commentId", protect, editComment);
router.put("/:postId/comment/:commentId", protect, editComment);
router.delete("/:postId/comment/:commentId", protect, deleteComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);
router.put("/:postId/comments/:commentId/react", protect, toggleCommentReaction);

router.delete("/:id", protect, deletePost);

export default router;
