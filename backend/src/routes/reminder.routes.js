import { Router } from "express";
import { getReminders, createReminder, updateReminder, deleteReminder } from "../controllers/reminder.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", getReminders);
router.post("/", createReminder);
router.patch("/:id", updateReminder);
router.delete("/:id", deleteReminder);

export default router;