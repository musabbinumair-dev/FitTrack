import express from "express";
import auth from "../middleware/auth.js";
import requireAdmin from "../middleware/admin.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAnalytics,
  getAdminNotifications,
  markAdminNotificationsRead,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require valid authentication & admin role
router.use(auth);
router.use(requireAdmin);

router.get("/users", getUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/analytics", getAnalytics);
router.get("/notifications", getAdminNotifications);
router.post("/notifications/mark-read", markAdminNotificationsRead);

export default router;
