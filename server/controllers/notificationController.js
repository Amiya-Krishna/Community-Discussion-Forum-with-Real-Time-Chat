import Notification from "../models/Notification.js";

// GET notifications
export const getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE notification (system use)
export const createNotification = async (userId, message) => {
  try {
    await Notification.create({
      userId,
      message
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