import mongoose from "mongoose";
import crypto from "crypto";

const fileShareSchema = new mongoose.Schema(
    {
        // Unique shareable link ID
        shareId: {
            type: String,
            unique: true,
            required: true,
            default: () => crypto.randomBytes(16).toString("hex"),
        },

        // File metadata
        fileName: {
            type: String,
            required: true,
        },

        fileSize: {
            type: Number,
            required: true,
        },

        fileType: {
            type: String,
            required: true,
        },

        // Storage information
        publicId: {
            type: String,
            required: true,
        },

        url: {
            type: String,
            required: true,
        },

        // Uploader information
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        uploaderName: {
            type: String,
            required: true,
        },

        // Receiver information
        receiverPhone: {
            type: String,
            required: true,
        },

        // Download tracking
        downloadCount: {
            type: Number,
            default: 0,
        },

        lastDownloadedAt: {
            type: Date,
        },

        // Optional expiration
        expiresAt: {
            type: Date,
        },

        // Status
        isActive: {
            type: Boolean,
            default: true,
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
