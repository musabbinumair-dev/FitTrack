import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendSupportConfirmationEmail, sendSupportEmailToAdmin } from "../services/email.service.js";

async function createTicket(req, res) {
  try {
    const { subject, message, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const user = await User.findById(req.userId);
    const userName = user?.name || user?.username || "Athlete";
    const userEmail = user?.email || "";

    const ticket = await SupportTicket.create({
      userId: req.userId,
      userName,
      userEmail,
      subject: subject.trim(),
      message: message.trim(),
      category: category || "feedback"
    });

    const ticketShortId = ticket._id.toString().slice(-6).toUpperCase();

    // 1. Send confirmation to the submitting user
    if (userEmail) {
      sendSupportConfirmationEmail({
        to: userEmail,
        userName,
        ticketId: ticketShortId,
        subject: ticket.subject,
        category: ticket.category,
        message: ticket.message
      }).catch((err) => console.log("Non-blocking support user email error:", err.message));
    }

    // 2. Find admin to forward user email to
    // First look for admin who set an adminSupportEmail in preferences, or any admin user
    const adminWithCustomEmail = await User.findOne({
      role: "admin",
      "preferences.adminSupportEmail": { $exists: true, $ne: "" }
    });
    const defaultAdmin = adminWithCustomEmail || (await User.findOne({ role: "admin" }));
    const targetAdminEmail =
      adminWithCustomEmail?.preferences?.adminSupportEmail ||
      defaultAdmin?.preferences?.adminSupportEmail ||
      defaultAdmin?.email ||
      process.env.ADMIN_SUPPORT_EMAIL;

    if (targetAdminEmail) {
      sendSupportEmailToAdmin({
        to: targetAdminEmail,
        userName,
        userEmail,
        ticketId: ticketShortId,
        subject: ticket.subject,
        category: ticket.category,
        message: ticket.message
      }).catch((err) => console.log("Non-blocking admin support forward email error:", err.message));
    }

    // 3. Create an in-app system notification for the admin
    if (defaultAdmin) {
      Notification.create({
        userId: defaultAdmin._id,
        type: "system",
        message: `New User Inquiry: [${ticket.category.toUpperCase()}] ${userName} (${userEmail}): "${ticket.subject}"`,
        isRead: false
      }).catch((err) => console.log("Non-blocking admin in-app notification error:", err.message));
    }

    res.status(201).json({ message: "Support ticket submitted successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function getMyTickets(req, res) {
  try {
    const tickets = await SupportTicket.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { createTicket, getMyTickets };