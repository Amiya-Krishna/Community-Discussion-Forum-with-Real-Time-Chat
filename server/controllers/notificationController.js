import Notification from "../models/Notification.js";

// GET notifications
export const getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({
      userId: req.user.id
    })
      .populate("fromUser", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE notification (system use)
// opts: { type, link, fromUser }
export const createNotification = async (userId, message, opts = {}) => {
  try {
    await Notification.create({
      userId,
      message,
      type: opts.type || "system",
      link: opts.link || null,
      fromUser: opts.fromUser || null,
    });
  } catch (err) {
    console.log(err);
  }
};

// MARK as read
export const markAsRead = async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id },
    { read: true }
  );

  res.json({ message: "All marked as read" });
};

// MARK single notification as read
export const markOneAsRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true }
  );
  res.json({ message: "Marked as read" });
};
