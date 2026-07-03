import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

chatMessageSchema.index({ roomId: 1, createdAt: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
