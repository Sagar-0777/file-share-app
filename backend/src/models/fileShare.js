import mongoose from "mongoose";
import crypto from "crypto";

const fileShareSchema = new mongoose.Schema(
    {
        // --- Sharing Metadata ---
        shareId: {
            type: String,
            unique: true,
            required: [true, "Share ID is required"],
            default: () => crypto.randomBytes(16).toString("hex"),
            trim: true,
        },

        // --- File Metadata ---
        fileName: {
            type: String,
            required: [true, "File name is required"],
            trim: true,
        },
        fileSize: {
            type: Number,
            required: [true, "File size is required"],
        },
        fileType: {
            type: String,
            required: [true, "File type is required"],
            trim: true,
        },

        // --- Cloudinary Storage Information ---
        publicId: {
            type: String,
            required: [true, "Cloudinary public ID is required"],
            trim: true,
        },
        url: {
            type: String,
            required: [true, "Cloudinary URL is required"],
            trim: true,
        },

        // --- Uploader Information ---
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader user ID is required"],
            index: true,
        },
        uploaderName: {
            type: String,
            required: [true, "Uploader name is required"],
            trim: true,
        },

        // --- Receiver & Tracking ---
        receiverPhone: {
            type: String,
            required: [true, "Receiver phone number is required"],
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, "Please fill a valid phone number"],
            index: true,
        },
        downloadCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastDownloadedAt: {
            type: Date,
        },

        // --- Expiration & Status ---
        expiresAt: {
            type: Date,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
fileShareSchema.index({ uploadedBy: 1, createdAt: -1 });

const FileShare = mongoose.model("FileShare", fileShareSchema);

export default FileShare;
