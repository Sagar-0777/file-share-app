import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../services/upload';
import { validatePhoneNumber } from '../utils/validation';
import { validateFileSize, formatFileSize, getFileIcon, getFileIconColor, generateShareLink, copyToClipboard } from '../utils/fileHelpers';
import Button from '../components/Button';
import { FaUpload, FaPhone, FaCheck, FaCopy, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './Upload.css';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [receiverPhone, setReceiverPhone] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [shareLink, setShareLink] = useState('');
    const [uploadComplete, setUploadComplete] = useState(false);
    const navigate = useNavigate();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            const selectedFile = acceptedFiles[0];
            if (!validateFileSize(selectedFile)) {
                toast.error('File size must be less than 100MB');
                return;
            }
            setFile(selectedFile);
        },
        multiple: false,
        maxSize: 100 * 1024 * 1024, // 100MB
    });

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            toast.error('Please select a file');
            return;
        }

        const fullPhone = `+91${receiverPhone}`;
        if (!validatePhoneNumber(fullPhone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        setUploading(true);
        try {
            const response = await uploadFile(file, fullPhone, (progress) => {
                setUploadProgress(progress);
            });

            if (response.success) {
                const link = generateShareLink(response.data.shareId);
                setShareLink(link);
                setUploadComplete(true);
                toast.success('File uploaded successfully!');
            }
        } catch (error) {
            toast.error(error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleCopyLink = async () => {
        const success = await copyToClipboard(shareLink);
        if (success) {
            toast.success('Link copied to clipboard!');
        } else {
            toast.error('Failed to copy link');
        }
    };

    const handleReset = () => {
        setFile(null);
        setReceiverPhone('');
        setUploadProgress(0);
        setShareLink('');
        setUploadComplete(false);
    };

    const FileIcon = file ? getFileIcon(file.type) : FaUpload;
    const iconColor = file ? getFileIconColor(file.type) : 'var(--color-primary)';

    if (uploadComplete) {
        return (
            <div className="upload-page">
                <div className="container">
                    <motion.div
                        className="success-card glass"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="success-icon">
                            <FaCheck />
                        </div>
                        <h1>Upload Successful!</h1>
                        <p>Your file has been uploaded and shared</p>

                        <div className="share-link-container">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="share-link-input"
                            />
                            <Button onClick={handleCopyLink} icon={FaCopy}>
                                Copy Link
                            </Button>
                        </div>

                        <div className="success-actions">
                            <Button onClick={handleReset} variant="secondary">
                                Upload Another File
                            </Button>
                            <Button onClick={() => navigate('/my-files')} variant="primary">
                                View My Files
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="upload-page">
            <div className="container">
                <motion.div
                    className="upload-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="upload-header">
                        <button onClick={() => navigate('/')} className="back-btn">
                            <FaArrowLeft /> Back
                        </button>
                        <h1>Upload & Share</h1>
                        <p>Share files securely with anyone</p>
                    </div>

                    <form onSubmit={handleUpload} className="upload-form">
                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={`dropzone glass ${isDragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="dropzone-content">
                                <FileIcon style={{ fontSize: '4rem', color: iconColor }} />
                                {file ? (
                                    <>
                                        <h3>{file.name}</h3>
                                        <p>{formatFileSize(file.size)}</p>
                                    </>
                                ) : (
                                    <>
                                        <h3>
                                            {isDragActive
                                                ? 'Drop file here'
                                                : 'Drag & drop file here'}
                                        </h3>
                                        <p>or click to browse (max 100MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Receiver Phone */}
                        {file && (
                            <motion.div
                                className="form-group"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <label htmlFor="receiver">Receiver's Phone Number</label>
                                <div className="input-with-icon">
                                    <FaPhone className="input-icon" />
                                    <div className="phone-input-container">
                                        <span className="country-code">+91</span>
                                        <input
                                            type="tel"
                                            id="receiver"
                                            placeholder="00000 00000"
                                            value={receiverPhone}
                                            onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            required
                                        />
                                    </div>
                                </div>
                                <small className="form-hint">
                                    Receiver will get an SMS with the download link
                                </small>
                            </motion.div>
                        )}

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p>{uploadProgress}% uploaded</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        {file && (
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={uploading}
                                icon={FaUpload}
                            >
                                Upload & Share
                            </Button>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Upload;
