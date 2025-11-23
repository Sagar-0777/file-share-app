import User from "../models/user.js";
import OTP from "../models/otp.js";
import { generateOTP, sendOTP } from "../utils/sms.js";
import { generateToken } from "../middleware/jwtAuth.js";

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
export const sendOTPController = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        // Validate phone number format (basic check)
        if (!phoneNumber.startsWith("+")) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be in E.164 format (e.g., +1234567890)",
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database
        await OTP.create({
            phoneNumber,
            otp,
        });

        // Send OTP via SMS
        await sendOTP(phoneNumber, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
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
        const otpRecord = await OTP.findOne({
            phoneNumber,
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
        let user = await User.findOne({ phoneNumber });

        if (!user) {
            // Create new user
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required for new users",
                });
            }

            user = await User.create({
                phoneNumber,
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
            token,
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                email: user.email,
                profilePicture: user.profilePicture,
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
            user: {
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
            user: {
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
