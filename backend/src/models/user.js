import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // Auth0 user ID (for users who login via Auth0)
        auth0Id: {
            type: String,
            sparse: true,
            unique: true,
        },

        // Phone number (for users who login via OTP)
        phoneNumber: {
            type: String,
            sparse: true,
            unique: true,
        },

        // Common user information
        email: {
            type: String,
            sparse: true,
        },

        name: {
            type: String,
            required: true,
        },

        profilePicture: {
            type: String,
            default: "",
        },

        // Phone verification status
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },

        // Track authentication method
        authMethod: {
            type: String,
            enum: ["auth0", "phone"],
            required: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Ensure at least one authentication method is present
userSchema.pre("save", function (next) {
    if (!this.auth0Id && !this.phoneNumber) {
        next(new Error("User must have either auth0Id or phoneNumber"));
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;
