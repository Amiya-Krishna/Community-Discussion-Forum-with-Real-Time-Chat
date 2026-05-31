import express from "express";
import { registerUser, loginUser, getAllUsers, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", protect, getAllUsers);
router.put("/profile", protect, updateProfile);

export default router;