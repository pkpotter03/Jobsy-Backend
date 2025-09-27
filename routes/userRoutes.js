import express from "express";
import { updateProfile, getUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.put("/profile", protect, upload.single("resume"), updateProfile);
router.get("/:id", protect, getUserProfile);

export default router;
