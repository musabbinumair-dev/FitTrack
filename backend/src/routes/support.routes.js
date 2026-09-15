import { Router } from "express";
import { createTicket, getMyTickets } from "../controllers/support.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/tickets", createTicket);
router.get("/tickets", getMyTickets);

export default router;