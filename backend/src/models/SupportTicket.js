import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, trim: true },
    userEmail: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: { type: String, enum: ["bug", "feedback", "contact", "other"], default: "feedback" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    emailSent: { type: Boolean, default: false }
  },
  { timestamps: true, collection: "supporttickets" }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
