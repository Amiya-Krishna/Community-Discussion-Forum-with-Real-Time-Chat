import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// POST /api/upload — accepts multipart field "image", returns { url }
router.post("/", protect, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const base = process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
  const url = `${base}/uploads/${req.file.filename}`;

  res.status(201).json({ url, filename: req.file.filename });
});

export default router;
