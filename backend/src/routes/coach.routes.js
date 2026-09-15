import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/env.js";
import { askCoach } from "../controllers/coach.controller.js";

const router = Router();

// Soft auth: extract userId if token is present, allow query to proceed either way
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
      req.userId = decoded.userId || decoded.id || decoded._id;
    } catch {
      // ignore invalid token in soft auth
    }
  }
  next();
});

router.post("/chat", askCoach);

export default router;
