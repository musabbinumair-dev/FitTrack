import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["workout", "meal", "custom"], required: true },
    label: { type: String, required: true, trim: true },
    scheduleType: { type: String, enum: ["once", "daily", "weekly"], default: "daily" },
    triggerTime: { type: String, required: true },
    daysOfWeek: { type: [Number], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, collection: "reminders" }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
