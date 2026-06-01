export const initSocket = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // SEND MESSAGE
        socket.on("sendMessage", ({ roomId, message, user, userId }) => {
      const msgData = {
        message,
        user,
        userId,
        timestamp: new Date().toISOString(),
      };

      io.to(roomId).emit("receiveMessage", msgData);
    });

    // ✅ TYPING INDICATOR (FIXED POSITION)
    socket.on("typing", ({ roomId, user }) => {
      socket.to(roomId).emit("showTyping", user);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });

};