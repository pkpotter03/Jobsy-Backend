import express from "express";
import { register, login, refreshToken } from "../controllers/authController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/register", upload.single("resume"), register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

export default router;
