import User from "../models/user.js";
import OTP from "../models/otp.js";
import { generateOTP, sendOTP } from "../utils/sms.js";
import { generateToken } from "../middleware/jwtAuth.js";
import { normalizePhoneNumber } from "../utils/validation.js";

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
export const sendOTPController = async (req, res) => {
    console.log("DEBUG: sendOTPController hit with body:", req.body);
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        // Normalize and validate phone number format
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        if (!normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid phone number (e.g., +1234567890)",
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Create OTP record
        await OTP.create({
            phoneNumber: normalizedPhone,
            otp,
        });

        // Check if user exists
        const userExists = await User.exists({ phoneNumber: normalizedPhone });

        // Send OTP via SMS
        await sendOTP(normalizedPhone, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: {
                isNewUser: !userExists
            }
        });
    } catch (error) {
        console.error("Send OTP error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send OTP",
        });
    }
};

/**
 * Verify OTP and login/register user
 * POST /api/auth/verify-otp
 */
export const verifyOTPController = async (req, res) => {
    try {
        const { phoneNumber, otp, name } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required",
            });
        }

        // Find the most recent OTP for this phone number
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        if (!normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number",
            });
        }

        const otpRecord = await OTP.findOne({
            phoneNumber: normalizedPhone,
            isVerified: false,
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one.",
            });
        }

        // Check if OTP is expired
        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        // Check if too many attempts
        if (otpRecord.attempts >= 3) {
            return res.status(400).json({
                success: false,
                message: "Too many failed attempts. Please request a new OTP.",
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        await otpRecord.save();

        // Find or create user
        let user = await User.findOne({ phoneNumber: normalizedPhone });

        if (!user) {
            // Create new user
            if (!name || name.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Welcome! Please enter your full name to complete registration.",
                });
            }

            user = await User.create({
                phoneNumber: normalizedPhone,
                name,
                authMethod: "phone",
                isPhoneVerified: true,
            });
        } else {
            // Update verification status
            user.isPhoneVerified = true;
            await user.save();
        }

        // Generate JWT token
        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    profilePicture: user.profilePicture,
                },
            },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};

/**
 * Get user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                authMethod: user.authMethod,
                isPhoneVerified: user.isPhoneVerified,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get profile",
        });
    }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, email, profilePicture } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};
