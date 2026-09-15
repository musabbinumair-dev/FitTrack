import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import nutritionRoutes from "./routes/nutrition.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";
import supportRoutes from "./routes/support.routes.js";
import exportRoutes from "./routes/export.routes.js";
import authGoogleRoutes from "./routes/auth.google.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import coachRoutes from "./routes/coach.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", authGoogleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/export", exportRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

export default app;