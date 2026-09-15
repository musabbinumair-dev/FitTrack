import { Router } from "express";
import { getRoutines, createRoutine, getRoutine, updateRoutine, deleteRoutine, createLog, getLogs, deleteLog } from "../controllers/workout.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/routines", getRoutines);
router.post("/routines", createRoutine);
router.get("/routines/:id", getRoutine);
router.put("/routines/:id", updateRoutine);
router.delete("/routines/:id", deleteRoutine);

router.post("/logs", createLog);
router.get("/logs", getLogs);
router.delete("/logs/:id", deleteLog);

export default router;