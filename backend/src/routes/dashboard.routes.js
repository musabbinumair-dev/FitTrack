import { Router } from "express";
import { getSummary } from "../controllers/dashboard.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/summary", getSummary);

export default router;