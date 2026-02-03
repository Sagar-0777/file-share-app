import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        // --- Core OTP Fields ---
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            index: true,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, "Please fill a valid phone number"],
        },

        otp: {
            type: String,
            required: [true, "OTP code is required"],
            trim: true,
        },

        // --- Expiration & Verification ---
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 5 * 60 * 1000), // Default: 5 minutes from now
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        // --- Rate Limiting / Security ---
        attempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// TTL index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups
otpSchema.index({ phoneNumber: 1, createdAt: -1 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
