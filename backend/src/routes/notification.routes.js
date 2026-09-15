import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead, sendTestEmail } from "../controllers/notification.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.post("/test-email", sendTestEmail);

export default router;