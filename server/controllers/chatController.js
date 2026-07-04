import ChatMessage from "../models/ChatMessage.js";
import { getIO } from "../utils/socketServer.js";

const parseRoomId = (roomId) => {
  const [firstId, secondId] = String(roomId || "").split("_");
  if (!firstId || !secondId) return null;
  return [firstId, secondId];
};

export const getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const participants = parseRoomId(roomId);

    if (!participants) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    if (!participants.includes(String(req.user._id))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await ChatMessage.find({ roomId })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .lean();

    return res.json(
      messages.map((msg) => ({
        _id: msg._id,
        roomId: msg.roomId,
        message: msg.message,
        image: msg.image,
        timestamp: msg.createdAt,
        user: msg.sender?.name || "User",
        userId: msg.sender?._id,
        reactions: (msg.reactions || []).map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
          userName: r.userName,
        })),
      })),
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { roomId, messageId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== "string")
      return res.status(400).json({ message: "Invalid message" });

    const msg = await ChatMessage.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (String(msg.sender) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    msg.message = message;
    await msg.save();

    const payload = {
      _id: msg._id,
      roomId: msg.roomId,
      message: msg.message,
      image: msg.image,
      timestamp: msg.updatedAt || msg.createdAt,
      user: req.user.name,
      userId: req.user._id,
    };

    const io = getIO();
    if (io) io.to(roomId).emit("updateMessage", payload);

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { roomId, messageId } = req.params;

    const msg = await ChatMessage.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (String(msg.sender) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    await ChatMessage.deleteOne({ _id: messageId });

    const io = getIO();
    if (io) io.to(roomId).emit("deleteMessage", { _id: messageId, roomId });

    return res.json({ message: "deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
