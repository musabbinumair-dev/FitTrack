import Notification from "../models/Notification.js";
import User from "../models/User.js";
import WorkoutLog from "../models/WorkoutLog.js";
import { sendDigestEmail } from "../services/email.service.js";

async function getNotifications(req, res) {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { userId: req.userId };
    if (unreadOnly === "true") filter.isRead = false;

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

    res.json({ notifications, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function markAllAsRead(req, res) {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function sendTestEmail(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const recipient = req.body?.recipientEmail || user.email || "yousha.mirza328@gmail.com";
    const workoutCount = await WorkoutLog.countDocuments({ userId: req.userId });

    const stats = {
      totalCalories: user.dailyCalorieGoal || user.calorieGoal || 2450,
      totalWorkouts: workoutCount || 4,
      currentWeight: user.weight ? `${user.weight} ${user.weightUnit || "kg"}` : "Not recorded",
      fitnessGoal: user.fitnessGoal ? user.fitnessGoal.replace("_", " ") : "Maintain Fitness"
    };

    const emailResult = await sendDigestEmail({
      to: recipient,
      userName: user.name,
      stats
    });

    const successMsg = `Performance digest sent to ${recipient} from Fitness Tracker`;

    const notification = await Notification.create({
      userId: req.userId,
      type: "system",
      message: successMsg,
      isRead: false
    });

    res.json({
      message: successMsg,
      recipient,
      sender: "Fitness Tracker <yousha.mirza328@gmail.com>",
      deliveryMode: emailResult.mode,
      messageId: emailResult.messageId,
      notification
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email: " + error.message });
  }
}

export { getNotifications, markAsRead, markAllAsRead, sendTestEmail };