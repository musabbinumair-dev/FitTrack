import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "my_access_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "my_refresh_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3001";
const EMAIL_USER = process.env.EMAIL_USER || "yousha.mirza328@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "";
const EMAIL_FROM = process.env.EMAIL_FROM || '"Fitness Tracker" <yousha.mirza328@gmail.com>';
const ENABLE_OTP = process.env.ENABLE_OTP === "true"; // Temporarily disabled for production phase
const DISABLE_OTP = process.env.DISABLE_OTP !== "false";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fittrack.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

export {
  PORT,
  MONGODB_URI,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  CLIENT_ORIGIN,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  ENABLE_OTP,
  DISABLE_OTP,
  ADMIN_EMAIL,
  ADMIN_PASSWORD
};