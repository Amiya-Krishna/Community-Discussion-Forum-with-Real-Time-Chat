import express from "express";
import {
  deleteMessage,
  getChatHistory,
  updateMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:roomId", protect, getChatHistory);
router.put("/:roomId/messages/:messageId", protect, updateMessage);
router.delete("/:roomId/messages/:messageId", protect, deleteMessage);

export default router;
