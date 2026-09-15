import Reminder from "../models/Reminder.js";

async function getReminders(req, res) {
  try {
    const reminders = await Reminder.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ reminders });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function createReminder(req, res) {
  try {
    const { type, label, scheduleType, triggerTime, daysOfWeek } = req.body;

    if (!type || !label || !triggerTime) {
      return res.status(400).json({ message: "Type, label, and triggerTime are required" });
    }

    const reminder = await Reminder.create({
      userId: req.userId,
      type,
      label,
      scheduleType: scheduleType || "daily",
      triggerTime,
      daysOfWeek: daysOfWeek || []
    });

    res.status(201).json({ message: "Reminder created", reminder });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function updateReminder(req, res) {
  try {
    const { type, label, scheduleType, triggerTime, daysOfWeek, isActive } = req.body;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { type, label, scheduleType, triggerTime, daysOfWeek, isActive },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder updated", reminder });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function deleteReminder(req, res) {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { getReminders, createReminder, updateReminder, deleteReminder };