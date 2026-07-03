import express from "express";
import {
  forgotPassword,
  getAllUsers,
  getMe,
  loginUser,
  registerUser,
  resetPassword,
  sendOtp,
  updateProfile,
  verifyOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
// Fix: frontend calls this on app load to restore localStorage sessions.
router.get("/me", protect, getMe);
router.get("/users", protect, getAllUsers);
router.put("/profile", protect, updateProfile);

export default router;
