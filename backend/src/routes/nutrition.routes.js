import { Router } from "express";
import {
  getLog,
  getLogsRange,
  addMealItem,
  updateMealItem,
  deleteMealItem,
  updateWater,
  updateGoals,
  searchFoods
} from "../controllers/nutrition.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/foods/search", searchFoods);

router.use(auth);

router.get("/logs-range", getLogsRange);
router.get("/logs/:date", getLog);
router.post("/logs/:date/meals", addMealItem);
router.patch("/logs/:date/meals/:itemId", updateMealItem);
router.delete("/logs/:date/meals/:itemId", deleteMealItem);
router.patch("/logs/:date/water", updateWater);
router.patch("/logs/:date/goals", updateGoals);

export default router;