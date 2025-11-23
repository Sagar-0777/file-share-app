import FileShare from "../models/fileShare.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3.js";
import { sendDownloadLink } from "../utils/sms.js";

/**
 * Upload file and create shareable link
 * POST /api/upload
 */
export const uploadFile = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const { receiverPhone } = req.body;

        if (!receiverPhone) {
            return res.status(400).json({
                success: false,
                message: "Receiver phone number is required",
            });
        }

        // Validate phone number format
        if (!receiverPhone.startsWith("+")) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be in E.164 format (e.g., +1234567890)",
            });
        }

        // Upload to S3
        const { s3Key, s3Url } = await uploadToS3(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        // Create file share record
        const fileShare = await FileShare.create({
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            s3Key,
            s3Url,
            uploadedBy: req.user.id,
            uploaderName: req.user.name,
            receiverPhone,
        });

        // Generate shareable link
        const downloadLink = `${process.env.FRONTEND_URL}/download/${fileShare.shareId}`;

        // Send SMS notification to receiver
        try {
            await sendDownloadLink(
                receiverPhone,
                req.user.name,
                req.file.originalname,
                downloadLink
            );
        } catch (smsError) {
            console.error("SMS sending failed:", smsError);
            // Continue even if SMS fails
        }

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            file: {
                id: fileShare._id,
                fileName: fileShare.fileName,
                fileSize: fileShare.fileSize,
                fileType: fileShare.fileType,
                shareId: fileShare.shareId,
                downloadLink,
                receiverPhone: fileShare.receiverPhone,
                createdAt: fileShare.createdAt,
            },
        });
    } catch (error) {
        console.error("Upload file error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to upload file",
        });
    }
};

/**
 * Get all files uploaded by user
 * GET /api/upload
 */
export const getUserFiles = async (req, res) => {
    try {
        const files = await FileShare.find({
            uploadedBy: req.user.id,
            isActive: true,
        }).sort({ createdAt: -1 });

        const filesWithLinks = files.map((file) => ({
            id: file._id,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            shareId: file.shareId,
            downloadLink: `${process.env.FRONTEND_URL}/download/${file.shareId}`,
            receiverPhone: file.receiverPhone,
            downloadCount: file.downloadCount,
            createdAt: file.createdAt,
        }));

        return res.status(200).json({
            success: true,
            files: filesWithLinks,
        });
    } catch (error) {
        console.error("Get user files error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get files",
        });
    }
};

/**
 * Delete file
 * DELETE /api/upload/:fileId
 */
export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await FileShare.findOne({
            _id: fileId,
            uploadedBy: req.user.id,
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        // Delete from S3
        await deleteFromS3(file.s3Key);

        // Mark as inactive (soft delete)
        file.isActive = false;
        await file.save();

        return res.status(200).json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Delete file error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete file",
        });
    }
};
