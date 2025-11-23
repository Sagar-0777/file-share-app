import { s3 } from "../configration/aws.js";
import crypto from "crypto";

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{s3Key: string, s3Url: string}>}
 */
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
    try {
        // Generate unique file key
        const fileExtension = fileName.split(".").pop();
        const uniqueFileName = `${crypto.randomBytes(16).toString("hex")}.${fileExtension}`;
        const s3Key = `uploads/${uniqueFileName}`;

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: mimeType,
            // Make file publicly readable
            ACL: "public-read",
        };

        const result = await s3.upload(params).promise();

        return {
            s3Key: s3Key,
            s3Url: result.Location,
        };
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error("Failed to upload file to storage.");
    }
};

/**
 * Delete file from S3
 * @param {string} s3Key - S3 object key
 */
export const deleteFromS3 = async (s3Key) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
        };

        await s3.deleteObject(params).promise();
        console.log(`Deleted file from S3: ${s3Key}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting from S3:", error);
        throw new Error("Failed to delete file from storage.");
    }
};

/**
 * Generate a presigned URL for temporary access (optional, for private files)
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 */
export const generatePresignedUrl = async (s3Key, expiresIn = 3600) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Expires: expiresIn,
        };

        const url = await s3.getSignedUrlPromise("getObject", params);
        return url;
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw new Error("Failed to generate download URL.");
    }
};
