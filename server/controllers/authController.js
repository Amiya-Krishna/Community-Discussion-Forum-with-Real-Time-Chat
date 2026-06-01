import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sendUser = (res, user, token) => {
  // Fix: keep auth response shape consistent for login/register/session restore.
  res.json({
    _id: user._id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    isAdmin: user.isAdmin,
    ...(token ? { token } : {}),
  });
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    // ✅ FIX: validation must be here
   if (!name || !mobile || !email || !password) {
  return res.status(400).json({ message: "All fields are required" });
}

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
    });

    // Fix: frontend stores this JWT in localStorage after signup.
    return sendUser(res.status(201), user, generateToken(user._id));

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or mobile already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Fix: frontend persists this token and sends it as Bearer auth.
      return sendUser(res, user, generateToken(user._id));
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// CURRENT USER
export const getMe = async (req, res) => {
  // Fix: /auth/me lets the frontend rehydrate user state after refresh.
  return sendUser(res, req.user);
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const userId = req.user._id;
    const updates = {};

    // Fix: validate provided fields without overwriting missing values.
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Name is required" });
      updates.name = name.trim();
    }
    if (email !== undefined) {
      if (!email.trim()) return res.status(400).json({ message: "Email is required" });
      updates.email = email.trim();
    }
    if (mobile !== undefined) {
      if (!mobile.trim()) return res.status(400).json({ message: "Mobile is required" });
      updates.mobile = mobile.trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return sendUser(res, user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or mobile already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

// JWT TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
