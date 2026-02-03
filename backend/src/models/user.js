import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // --- Authentication Fields ---
        auth0Id: {
            type: String,
            sparse: true,
            unique: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            sparse: true,
            unique: true,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, "Please fill a valid phone number"],
        },
        authMethod: {
            type: String,
            enum: ["auth0", "phone"],
            required: [true, "Authentication method is required"],
        },

        // --- Personal Information ---
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
        },
        email: {
            type: String,
            sparse: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid email address",
            ],
        },
        profilePicture: {
            type: String,
            default: "",
            trim: true,
        },

        // --- Status Fields ---
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware: Ensure valid auth method and identifiers
userSchema.pre("save", async function () {
    // Check if at least one auth identifier is present
    if (!this.auth0Id && !this.phoneNumber) {
        throw new Error("User must have either auth0Id or phoneNumber");
    }

    // Optional: Log successful save for debugging in dev
    if (process.env.NODE_ENV === "development") {
        console.log(`💾 Saving user: ${this.name} (${this.phoneNumber || this.auth0Id})`);
    }
});

const User = mongoose.model("User", userSchema);

export default User;
