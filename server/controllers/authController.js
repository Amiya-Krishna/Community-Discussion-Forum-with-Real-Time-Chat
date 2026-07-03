import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendSms } from "../utils/sendSms.js";

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
      return res
        .status(400)
        .json({ message: "Email or mobile already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
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

// FORGOT PASSWORD - send reset email (Resend)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always return success to avoid user enumeration
    if (!user)
      return res.json({
        message:
          "If an account exists, you will receive reset instructions shortly",
      });

    // create token
    const plainToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(plainToken).digest("hex");
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // client_base is normalized (trailing slash + first origin only, since
    // CLIENT_URL may hold a comma-separated list of allowed origins).
    const clientBase = (process.env.CLIENT_URL || "")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");
    const resetUrl = `${clientBase}/reset-password?token=${plainToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password. This link is valid for 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });

    return res.json({
      message:
        "If an account exists, you will receive reset instructions shortly",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD - accept token (plain), email, new password
export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return res.status(400).json({ message: "Missing parameters" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email,
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
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
      if (!name.trim())
        return res.status(400).json({ message: "Name is required" });
      updates.name = name.trim();
    }
    if (email !== undefined) {
      if (!email.trim())
        return res.status(400).json({ message: "Email is required" });
      updates.email = email.trim();
    }
    if (mobile !== undefined) {
      if (!mobile.trim())
        return res.status(400).json({ message: "Mobile is required" });
      updates.mobile = mobile.trim();
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return sendUser(res, user);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email or mobile already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

// OTP LOGIN — STEP 1: generate + deliver a 6-digit code for an existing user.
// channel: "email" (sent via Resend) or "mobile" (sent via Fast2SMS)
export const sendOtp = async (req, res) => {
  try {
    const { identifier, channel } = req.body;
    if (!identifier || !["email", "mobile"].includes(channel)) {
      return res
        .status(400)
        .json({ message: "identifier and a valid channel are required" });
    }

    const query = channel === "email" ? { email: identifier } : { mobile: identifier };
    const user = await User.findOne(query);

    const genericMsg =
      channel === "email"
        ? "If an account exists, an OTP has been sent to your email"
        : "If an account exists, an OTP has been sent to your mobile number";

    // Don't reveal whether the account exists.
    if (!user) return res.json({ message: genericMsg });

    // Throttle: block a new OTP request if one was issued in the last 60s.
    const recent = await Otp.findOne({ identifier, channel }).sort({ createdAt: -1 });
    if (recent && Date.now() - new Date(recent.createdAt).getTime() < 60 * 1000) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another OTP",
      });
    }

    const otp = String(crypto.randomInt(100000, 1000000)); // 6 digits
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Only one active OTP per identifier+channel at a time.
    await Otp.deleteMany({ identifier, channel });
    await Otp.create({
      identifier,
      channel,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    let result;
    if (channel === "email") {
      result = await sendEmail({
        to: identifier,
        subject: "Your login OTP",
        html: `<p>Your one-time login code is:</p><h2 style="letter-spacing:4px;">${otp}</h2><p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>`,
      });
    } else {
      result = await sendSms({ to: identifier, otp });
    }

    if (!result.ok) {
      // Delivery failed (e.g. missing/invalid provider key) — don't leave a
      // dangling OTP the user can never receive.
      await Otp.deleteMany({ identifier, channel });
      return res.status(502).json({
        message: `Failed to send OTP via ${channel === "email" ? "email" : "SMS"}. Please try again shortly.`,
      });
    }

    return res.json({ message: genericMsg });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// OTP LOGIN — STEP 2: verify the code and log the user in
export const verifyOtp = async (req, res) => {
  try {
    const { identifier, channel, otp } = req.body;
    if (!identifier || !["email", "mobile"].includes(channel) || !otp) {
      return res
        .status(400)
        .json({ message: "identifier, channel and OTP are required" });
    }

    const record = await Otp.findOne({ identifier, channel }).sort({ createdAt: -1 });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }

    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      return res
        .status(429)
        .json({ message: "Too many attempts. Please request a new OTP" });
    }

    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
    if (otpHash !== record.otpHash) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    const query = channel === "email" ? { email: identifier } : { mobile: identifier };
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: "User not found" });

    // OTP consumed — remove it so it can't be reused.
    await Otp.deleteOne({ _id: record._id });

    return sendUser(res, user, generateToken(user._id));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// JWT TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
