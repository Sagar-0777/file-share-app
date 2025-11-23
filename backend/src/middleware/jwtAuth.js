import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Middleware to verify JWT token (for OTP-based authentication)
 * This creates custom JWT tokens for users who login via phone OTP
 */
export const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token - user not found",
            });
        }

        // Attach user to request
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            authMethod: user.authMethod,
        };

        next();
    } catch (error) {
        console.error("Token verification error:", error);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

/**
 * Generate JWT token for OTP users
 */
export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Token valid for 7 days
    );
};
