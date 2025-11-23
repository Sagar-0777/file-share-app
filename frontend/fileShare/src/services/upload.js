import api from './api';

/**
 * Upload file with progress tracking
 * @param {File} file - File to upload
 * @param {string} receiverPhone - Receiver's phone number
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} Upload response with share link
 */
export const uploadFile = async (file, receiverPhone, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiverPhone', receiverPhone);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            if (onProgress) {
                onProgress(percentCompleted);
            }
        },
    });

    return response.data;
};

/**
 * Get user's uploaded files
 * @returns {Promise} Array of user's files
 */
export const getUserFiles = async () => {
    const response = await api.get('/upload');
    return response.data;
};

/**
 * Delete a file
 * @param {string} fileId - ID of file to delete
 * @returns {Promise} Deletion confirmation
 */
export const deleteFile = async (fileId) => {
    const response = await api.delete(`/upload/${fileId}`);
    return response.data;
};
