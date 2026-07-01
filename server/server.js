import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import postRoutes from "./routes/postRoutes.js";

import { initSocket } from "./socket/chatSocket.js";

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
  "http://localhost:3000"
].map((url) => url.trim().replace(/\/$/, "")); // remove trailing slash

const corsOptionsDelegate = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server, health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptionsDelegate));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Create HTTP server (IMPORTANT for Socket.IO)
const server = createServer(app);

// Attach Socket.IO to server (THIS WAS YOUR ISSUE)
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      console.warn(`Socket.IO CORS blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});
// Initialize socket logic
initSocket(io);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
