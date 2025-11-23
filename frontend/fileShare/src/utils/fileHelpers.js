import {
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileImage,
    FaFileVideo,
    FaFileAudio,
    FaFileArchive,
    FaFileCode,
    FaFile,
} from 'react-icons/fa';

/**
 * Format bytes to human readable file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get file icon component based on file type
 * @param {string} fileType - MIME type or file extension
 * @returns {Component} React icon component
 */
export const getFileIcon = (fileType) => {
    const type = fileType.toLowerCase();

    // PDF
    if (type.includes('pdf')) return FaFilePdf;

    // Word
    if (type.includes('word') || type.includes('doc')) return FaFileWord;

    // Excel
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls'))
        return FaFileExcel;

    // PowerPoint
    if (type.includes('powerpoint') || type.includes('presentation') || type.includes('ppt'))
        return FaFilePowerpoint;

    // Images
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('gif') || type.includes('svg'))
        return FaFileImage;

    // Videos
    if (type.includes('video') || type.includes('mp4') || type.includes('avi') || type.includes('mov'))
        return FaFileVideo;

    // Audio
    if (type.includes('audio') || type.includes('mp3') || type.includes('wav'))
        return FaFileAudio;

    // Archives
    if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar') || type.includes('gz'))
        return FaFileArchive;

    // Code
    if (type.includes('javascript') || type.includes('python') || type.includes('java') || type.includes('html') || type.includes('css') || type.includes('json') || type.includes('xml'))
        return FaFileCode;

    // Default
    return FaFile;
};

/**
 * Get file icon color based on file type
 * @param {string} fileType - MIME type or file extension
 * @returns {string} CSS color value
 */
export const getFileIconColor = (fileType) => {
    const type = fileType.toLowerCase();

    if (type.includes('pdf')) return '#ff6b6b';
    if (type.includes('word') || type.includes('doc')) return '#4facfe';
    if (type.includes('excel') || type.includes('sheet')) return '#38ef7d';
    if (type.includes('powerpoint') || type.includes('presentation')) return '#f093fb';
    if (type.includes('image')) return '#ffd93d';
    if (type.includes('video')) return '#667eea';
    if (type.includes('audio')) return '#f5576c';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return '#b4b9d4';
    if (type.includes('code') || type.includes('javascript') || type.includes('python')) return '#00f2fe';

    return '#8b9eff';
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if valid
 */
export const validateFileSize = (file, maxSizeMB = 100) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (error) {
                textArea.remove();
                return false;
            }
        }
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

/**
 * Generate shareable link from share ID
 * @param {string} shareId - Share ID
 * @returns {string} Full shareable URL
 */
export const generateShareLink = (shareId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/download/${shareId}`;
};
