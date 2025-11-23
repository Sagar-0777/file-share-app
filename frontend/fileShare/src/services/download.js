import api from './api';

/**
 * Get file information by share ID (public - no auth required)
 * @param {string} shareId - Share ID from URL
 * @returns {Promise} File information
 */
export const getFileByShareId = async (shareId) => {
    const response = await api.get(`/download/${shareId}`);
    return response.data;
};
