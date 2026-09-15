import { Router } from "express";
import { exportProgress } from "../controllers/export.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/progress", exportProgress);

export default router;