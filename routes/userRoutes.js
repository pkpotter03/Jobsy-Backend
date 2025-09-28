import express from "express";
import { updateProfile, getUserProfilePrivate, getUserProfilePublic } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.put("/profile-update", protect, upload.single("resume"), updateProfile);
router.get("/profile", protect, getUserProfilePrivate);

// Public route to get user profile by ID without sensitive info
router.get("/:id", protect, getUserProfilePublic);

export default router;
