import { Router } from "express";
import { register, login, refresh, logout, forgotPassword, resetPassword, changePassword } from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/change-password", auth, changePassword);

export default router;