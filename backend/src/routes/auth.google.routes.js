import { Router } from "express";
import { googleAuthStart, googleAuthCallback } from "../controllers/auth.google.controller.js";

const router = Router();

router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

export default router;