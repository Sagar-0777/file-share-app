import { useState, useEffect } from 'react';
import { getUserFiles, deleteFile } from '../services/upload';
import { formatFileSize, getFileIcon, getFileIconColor, generateShareLink, copyToClipboard } from '../utils/fileHelpers';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCopy, FaTrash, FaFolder } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import './MyFiles.css';

const MyFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await getUserFiles();
            if (response.success) {
                setFiles(response.data);
            }
        } catch (error) {
            toast.error(error || 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (shareId) => {
        const link = generateShareLink(shareId);
        const success = await copyToClipboard(link);
        if (success) {
            toast.success('Link copied!');
        } else {
            toast.error('Failed to copy');
        }
    };

    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            await deleteFile(fileId);
            toast.success('File deleted');
            setFiles(files.filter((f) => f._id !== fileId));
        } catch (error) {
            toast.error(error || 'Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="my-files-page">
                <div className="container">
                    <div className="loading-container">
                        <LoadingSpinner size="lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-files-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Files</h1>
                    <p>Manage your uploaded files</p>
                </div>

                {files.length === 0 ? (
                    <motion.div
                        className="empty-state glass"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <FaFolder className="empty-icon" />
                        <h2>No files yet</h2>
                        <p>Upload your first file to get started</p>
                    </motion.div>
                ) : (
                    <div className="files-grid">
                        {files.map((file, index) => {
                            const FileIcon = getFileIcon(file.fileType);
                            const iconColor = getFileIconColor(file.fileType);

                            return (
                                <motion.div
                                    key={file._id}
                                    className="file-card glass"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="file-icon" style={{ color: iconColor }}>
                                        <FileIcon />
                                    </div>
                                    <div className="file-details">
                                        <h3>{file.fileName}</h3>
                                        <div className="file-meta">
                                            <span>{formatFileSize(file.fileSize)}</span>
                                            <span>•</span>
                                            <span>{format(new Date(file.createdAt), 'MMM dd')}</span>
                                        </div>
                                        <div className="file-stats">
                                            <span>To: {file.receiverPhone}</span>
                                            <span>{file.downloadCount} downloads</span>
                                        </div>
                                    </div>
                                    <div className="file-actions">
                                        <Button
                                            onClick={() => handleCopyLink(file.shareId)}
                                            variant="secondary"
                                            size="sm"
                                            icon={FaCopy}
                                        >
                                            Copy Link
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(file._id)}
                                            variant="danger"
                                            size="sm"
                                            icon={FaTrash}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFiles;
