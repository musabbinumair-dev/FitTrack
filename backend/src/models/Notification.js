import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["workout_completed", "goal_achieved", "reminder", "system"], required: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: "90d" }
  },
  { collection: "notifications" }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
