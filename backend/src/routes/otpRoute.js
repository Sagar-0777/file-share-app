import express from "express";
import { sendOtp } from "../controller/otpController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);

export default router;
