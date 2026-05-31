import express from "express";
import {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deletePost
} from "../controllers/postController.js";

import { deleteComment } from "../controllers/postController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", protect, getPosts);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);

// comment delete (FIXED)
router.delete("/:postId/comment/:commentId", protect, deleteComment);

// post delete
router.delete("/:id", protect, deletePost);

export default router;