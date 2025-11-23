import express from "express";
import {
    sendOTPController,
    verifyOTPController,
    getProfile,
    updateProfile,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/jwtAuth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/send-otp", sendOTPController);
router.post("/verify-otp", verifyOTPController);

// Protected routes (authentication required)
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

export default router;
