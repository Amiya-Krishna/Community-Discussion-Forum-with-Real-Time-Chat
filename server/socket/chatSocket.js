export const initSocket = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // SEND MESSAGE (optionally carries an `image` URL for image attachments)
        socket.on("sendMessage", ({ roomId, message, user, userId, image }) => {
      const msgData = {
        message,
        user,
        userId,
        image: image || null,
        timestamp: new Date().toISOString(),
      };

      io.to(roomId).emit("receiveMessage", msgData);
    });

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
    });

  });

};