import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from "../config/env.js";

function getTransporter() {
  const user = process.env.EMAIL_USER || EMAIL_USER || "yousha.mirza328@gmail.com";
  const pass = process.env.EMAIL_PASS || EMAIL_PASS || "";
  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass
      }
    });
  }
  return null;
}

async function sendDigestEmail({ to, userName, stats }) {
  const fromUser = process.env.EMAIL_USER || EMAIL_USER || "yousha.mirza328@gmail.com";
  const from = process.env.EMAIL_FROM || EMAIL_FROM || `"Fitness Tracker" <${fromUser}>`;
  const subject = "Weekly Fitness Digest & Performance Report - Fitness Tracker";

  const totalCalories = stats?.totalCalories || 2450;
  const totalWorkouts = stats?.totalWorkouts || 4;
  const currentWeight = stats?.currentWeight || "68 kg";
  const fitnessGoal = stats?.fitnessGoal || "Maintain Fitness";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #131418; padding: 28px; text-align: center;">
        <span style="background-color: #C4FA2A; color: #131418; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">Weekly Digest</span>
        <h1 style="color: #ffffff; margin: 16px 0 6px 0; font-size: 22px;">Fitness Tracker</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">Your weekly performance summary is ready</p>
      </div>
      <div style="padding: 28px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">Hello <strong>${userName || "Athlete"}</strong>,</p>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">Here is your weekly performance snapshot recorded in your personal Fitness Tracker profile.</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Workouts Logged</div>
            <div style="font-size: 20px; color: #0f172a; font-weight: bold; margin-top: 4px;">${totalWorkouts} sessions</div>
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Energy Output</div>
            <div style="font-size: 20px; color: #16a34a; font-weight: bold; margin-top: 4px;">${totalCalories.toLocaleString()} kcal</div>
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Latest Weigh-In</div>
            <div style="font-size: 20px; color: #0f172a; font-weight: bold; margin-top: 4px;">${currentWeight}</div>
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Active Target</div>
            <div style="font-size: 16px; color: #0f172a; font-weight: bold; margin-top: 6px; text-transform: capitalize;">${fitnessGoal}</div>
          </div>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 13px;">Coaching Note</h4>
          <p style="margin: 0; font-size: 12px; color: #15803d; line-height: 1.5;">Consistency is your superpower. Stay on top of your hydration and progressive overload this upcoming week to maintain peak athletic momentum!</p>
        </div>

        <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-bottom: 0;">
          This email was sent from <strong>Fitness Tracker</strong> (&lt;yousha.mirza328@gmail.com&gt;) to ${to}.
        </p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("SMTP credentials missing. Please set EMAIL_USER and EMAIL_PASS in backend/.env");
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html
  });

  return { success: true, messageId: info.messageId, mode: "smtp" };
}

async function sendSupportConfirmationEmail({ to, userName, ticketId, subject, category, message }) {
  const fromUser = process.env.EMAIL_USER || EMAIL_USER || "yousha.mirza328@gmail.com";
  const from = process.env.EMAIL_FROM || EMAIL_FROM || `"Fitness Tracker Support" <${fromUser}>`;
  const transporter = getTransporter();
  if (!transporter || !to) return false;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #131418; padding: 28px; text-align: center;">
        <span style="background-color: #C4FA2A; color: #131418; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">Support Request Received</span>
        <h1 style="color: #ffffff; margin: 16px 0 6px 0; font-size: 22px;">Fitness Tracker Support</h1>
      </div>
      <div style="padding: 28px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">Hello <strong>${userName || "Athlete"}</strong>,</p>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">Thank you for contacting Fitness Tracker Support. We have received your submission and our team is looking into it.</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <div style="font-size: 12px; color: #64748b;"><strong>Ticket ID:</strong> #${ticketId}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;"><strong>Category:</strong> ${category ? category.toUpperCase() : "GENERAL"}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;"><strong>Subject:</strong> ${subject}</div>
          <div style="font-size: 12px; color: #334155; margin-top: 8px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">${message}</div>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Fitness Tracker Support Team • yousha.mirza328@gmail.com</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `Support Ticket Received: [${subject}] (#${ticketId})`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send support email:", err.message);
    return false;
  }
}

async function sendSupportEmailToAdmin({ to, userName, userEmail, ticketId, subject, category, message }) {
  const fromUser = process.env.EMAIL_USER || EMAIL_USER || "yousha.mirza328@gmail.com";
  const from = process.env.EMAIL_FROM || EMAIL_FROM || `"Fitness Tracker Support Hub" <${fromUser}>`;
  const transporter = getTransporter();
  if (!transporter || !to) return false;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #131418; padding: 26px; text-align: center;">
        <span style="background-color: #C4FA2A; color: #131418; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">New User Inquiry / Ticket</span>
        <h1 style="color: #ffffff; margin: 14px 0 6px 0; font-size: 20px;">FitTrack Administrator Notification</h1>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">A user has submitted a new inquiry via the Support & Feedback center:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <div style="font-size: 12px; color: #64748b;"><strong>Ticket ID:</strong> #${ticketId}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;"><strong>From:</strong> ${userName || "User"} &lt;${userEmail}&gt;</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;"><strong>Category:</strong> ${category ? category.toUpperCase() : "GENERAL"}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;"><strong>Subject:</strong> ${subject}</div>
          <div style="font-size: 13px; color: #1e293b; margin-top: 10px; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; line-height: 1.5;">${message}</div>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">This message was forwarded to your configured admin support forwarding email address.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: userEmail,
      subject: `[User Ticket #${ticketId}] ${subject} (From ${userName})`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to forward support email to admin:", err.message);
    return false;
  }
}

export {
  sendDigestEmail,
  sendSupportConfirmationEmail,
  sendSupportEmailToAdmin,
};
