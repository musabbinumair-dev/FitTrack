import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getMe, updateMe, updatePreferences, uploadPhoto } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${req.userId}${ext}`);
  }
});

const upload = multer({ storage });

const router = Router();

router.use(auth);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/preferences", updatePreferences);
router.post("/me/photo", upload.single("photo"), uploadPhoto);

export default router;