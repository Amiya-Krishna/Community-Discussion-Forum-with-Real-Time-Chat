import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import { initSocket } from "./socket/chatSocket.js";
import { setIO } from "./utils/socketServer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Build a list of allowed origins from env (comma separated) + local dev defaults
const allowedOrigins = [
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : []),
  "http://localhost:5173",
  "http://localhost:3000",
].map((url) => url.trim().replace(/\/$/, "")); // remove trailing slash

// Vercel gives every deployment (production + every preview build) its own
// unique *.vercel.app URL, so a fixed allow-list would break every time a
// new deployment is made. Accept any origin on that shared domain in
// addition to whatever is explicitly configured via CLIENT_URL.
const isVercelPreviewOrigin = (hostname) => hostname.endsWith(".vercel.app");

const isOriginAllowed = (origin) => {
  if (!origin) return true; // curl, mobile apps, server-to-server, health checks
  const normalizedOrigin = origin.replace(/\/$/, "");
  if (allowedOrigins.includes(normalizedOrigin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (isVercelPreviewOrigin(hostname)) return true;
  } catch (e) {
    // ignore malformed origin header
  }
  return false;
};

const corsOptionsDelegate = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptionsDelegate));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handler (multer errors, etc.)
app.use((err, req, res, next) => {
  if (err) {
    return res
      .status(400)
      .json({ message: err.message || "Something went wrong" });
  }
  next();
});

// Create HTTP server (IMPORTANT for Socket.IO)
const server = createServer(app);

// Attach Socket.IO to server (THIS WAS YOUR ISSUE)
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      console.warn(`Socket.IO CORS blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// Initialize socket logic
initSocket(io);
setIO(io);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
