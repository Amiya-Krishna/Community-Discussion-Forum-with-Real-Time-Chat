import express from "express";
import { registerUser, loginUser, getMe, getAllUsers, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// Fix: frontend calls this on app load to restore localStorage sessions.
router.get("/me", protect, getMe);
router.get("/users", protect, getAllUsers);
router.put("/profile", protect, updateProfile);

export default router;
