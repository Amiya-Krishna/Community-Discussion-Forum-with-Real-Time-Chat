import ChatMessage from "../models/ChatMessage.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // presence tracking
    // socketId -> userId (string)
    if (!io._userSocketMap) io._userSocketMap = new Map();
    if (!io._userCounts) io._userCounts = new Map();

    // JOIN ROOM
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User left room: ${roomId}`);
    });

    // PRESENCE: client should emit 'userOnline' with their userId after connecting
    socket.on("userOnline", (userId) => {
      try {
        if (!userId) return;
        io._userSocketMap.set(socket.id, String(userId));
        const prev = io._userCounts.get(String(userId)) || 0;
        io._userCounts.set(String(userId), prev + 1);
        // Build online set
        const online = Array.from(
          new Set(Array.from(io._userSocketMap.values())),
        );
        io.emit("presenceUpdate", online);
      } catch (e) {
        console.error(e);
      }
    });

    // SEND MESSAGE (optionally carries an `image` URL for image attachments)
    socket.on(
      "sendMessage",
      async ({ roomId, message, user, userId, image }) => {
        const msgData = {
          roomId,
          message,
          user,
          userId,
          image: image || null,
          timestamp: new Date().toISOString(),
        };

        try {
          const participants = String(roomId || "")
            .split("_")
            .filter(Boolean);
          if (participants.length === 2 && userId) {
            const created = await ChatMessage.create({
              roomId,
              participants,
              sender: userId,
              message: message || "",
              image: image || null,
            });
            if (created?._id) {
              msgData._id = created._id;
              msgData.timestamp = created.createdAt;
            }
          }
        } catch (error) {
          console.error("Failed to save chat message:", error);
        }

        io.to(roomId).emit("receiveMessage", msgData);
      },
    );

    // ✅ TYPING INDICATOR (FIXED POSITION)
    socket.on("typing", ({ roomId, user }) => {
      socket.to(roomId).emit("showTyping", user);
    });

    socket.on("stopTyping", ({ roomId }) => {
      socket.to(roomId).emit("hideTyping");
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      try {
        const uid = io._userSocketMap.get(socket.id);
        if (uid) {
          io._userSocketMap.delete(socket.id);
          const prev = io._userCounts.get(uid) || 0;
          if (prev <= 1) {
            io._userCounts.delete(uid);
          } else {
            io._userCounts.set(uid, prev - 1);
          }
          const online = Array.from(
            new Set(Array.from(io._userSocketMap.values())),
          );
          io.emit("presenceUpdate", online);
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
};
