import { Router } from "express";
import { createMetric, getMetrics, getWeightAnalytics, getWorkoutAnalytics, getNutritionAnalytics } from "../controllers/progress.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/metrics", createMetric);
router.get("/metrics", getMetrics);
router.get("/analytics/weight", getWeightAnalytics);
router.get("/analytics/workouts", getWorkoutAnalytics);
router.get("/analytics/nutrition", getNutritionAnalytics);

export default router;