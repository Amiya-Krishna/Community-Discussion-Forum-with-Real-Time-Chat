import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  type: { type: String, default: "system" }, // system | comment | reaction | mention | message
  link: { type: String, default: null },      // frontend route to open (e.g. /discussion/:id)
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
