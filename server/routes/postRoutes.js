import express from "express";
import {
  createPost,
  getPosts,
  toggleLike,
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
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
// Fix: frontend calls PUT /api/posts/:id, not /api/posts/posts/:id.
router.put("/:id", protect, editPost);
// Fix: keep comment edit/delete routes consistent under /api/posts.
router.put("/:postId/comments/:commentId", protect, editComment);
router.put("/:postId/comment/:commentId", protect, editComment);
router.delete("/:postId/comment/:commentId", protect, deleteComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);
router.delete("/:id", protect, deletePost);

export default router;
