import FileShare from "../models/fileShare.js";

/**
 * Get file info and download link (public, no auth required)
 * GET /api/download/:shareId
 */
export const getFileByShareId = async (req, res) => {
    try {
        const { shareId } = req.params;

        const file = await FileShare.findOne({
            shareId,
            isActive: true,
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found or has been deleted",
            });
        }

        // Check if file has expired (if expiration is set)
        if (file.expiresAt && file.expiresAt < new Date()) {
            return res.status(410).json({
                success: false,
                message: "This file link has expired",
            });
        }

        // Increment download count
        file.downloadCount += 1;
        file.lastDownloadedAt = new Date();
        await file.save();

        return res.status(200).json({
            success: true,
            data: {
                fileName: file.fileName,
                fileSize: file.fileSize,
                fileType: file.fileType,
                url: file.url,
                uploaderName: file.uploaderName,
                createdAt: file.createdAt,
                downloadCount: file.downloadCount,
            },
        });
    } catch (error) {
        console.error("Get file by share ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get file",
        });
    }
};
