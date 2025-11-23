import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFileByShareId } from '../services/download';
import { formatFileSize, getFileIcon, getFileIconColor } from '../utils/fileHelpers';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaDownload, FaUser, FaCalendar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import './Download.css';

const Download = () => {
    const { shareId } = useParams();
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFileData = async () => {
            try {
                const response = await getFileByShareId(shareId);
                if (response.success) {
                    setFileData(response.data);
                }
            } catch (err) {
                setError(err || 'File not found or expired');
            } finally {
                setLoading(false);
            }
        };

        fetchFileData();
    }, [shareId]);

    const handleDownload = () => {
        if (fileData?.s3Url) {
            window.open(fileData.s3Url, '_blank');
            toast.success('Download started!');
        }
    };

    if (loading) {
        return (
            <div className="download-page">
                <div className="container">
                    <div className="loading-container">
                        <LoadingSpinner size="lg" />
                        <p>Loading file information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="download-page">
                <div className="container">
                    <motion.div
                        className="error-card glass"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="error-icon">❌</div>
                        <h1>File Not Found</h1>
                        <p>{error}</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    const FileIcon = getFileIcon(fileData.fileType);
    const iconColor = getFileIconColor(fileData.fileType);

    return (
        <div className="download-page">
            <div className="container">
                <motion.div
                    className="download-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="download-card glass">
                        {/* File Icon */}
                        <div className="file-icon-large" style={{ color: iconColor }}>
                            <FileIcon />
                        </div>

                        {/* File Info */}
                        <div className="file-info">
                            <h1>{fileData.fileName}</h1>
                            <div className="file-meta">
                                <span className="meta-item">
                                    <FaUser /> {fileData.uploaderName}
                                </span>
                                <span className="meta-item">
                                    {formatFileSize(fileData.fileSize)}
                                </span>
                                <span className="meta-item">
                                    <FaCalendar />{' '}
                                    {format(new Date(fileData.createdAt), 'MMM dd, yyyy')}
                                </span>
                            </div>
                            <div className="download-count">
                                Downloaded {fileData.downloadCount} times
                            </div>
                        </div>

                        {/* Download Button */}
                        <Button
                            onClick={handleDownload}
                            variant="primary"
                            size="lg"
                            fullWidth
                            icon={FaDownload}
                        >
                            Download File
                        </Button>

                        {/* Footer */}
                        <div className="download-footer">
                            <p>
                                This file was shared with you via <strong>FileShare</strong>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Download;
