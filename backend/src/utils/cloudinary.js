import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original file name (used for public_id)
 * @returns {Promise<{publicId: string, url: string}>}
 */
export const uploadToCloudinary = (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: 'file-share-app',
                public_id: `${Date.now()}-${fileName.split('.')[0]}`,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    publicId: result.public_id,
                    url: result.secure_url,
                });
            }
        );

        const stream = new Readable();
        stream.push(fileBuffer);
        stream.push(null);
        stream.pipe(uploadStream);
    });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise}
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};
