import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyOTP, sendOTP } from '../services/auth';
import { validateOTP } from '../utils/validation';
import Button from '../components/Button';
import { FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './OTPVerify.css';

const OTPVerify = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const phoneNumber = location.state?.phoneNumber;

    // Redirect if no phone number
    useEffect(() => {
        if (!phoneNumber) {
            navigate('/login');
        }
    }, [phoneNumber, navigate]);

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!validateOTP(otp)) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await verifyOTP(phoneNumber, otp);
            if (response.success) {
                login(response.data.user, response.data.token);
                toast.success('Login successful!');
                navigate('/');
            }
        } catch (error) {
            toast.error(error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        try {
            const response = await sendOTP(phoneNumber);
            if (response.success) {
                toast.success('OTP resent successfully!');
                setTimer(60);
                setOtp('');
            }
        } catch (error) {
            toast.error(error || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="otp-page">
            <motion.div
                className="otp-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="otp-card glass">
                    {/* Header */}
                    <div className="otp-header">
                        <div className="otp-icon">
                            <FaShieldAlt />
                        </div>
                        <h1>Verify OTP</h1>
                        <p>
                            Enter the 6-digit code sent to <br />
                            <strong>{phoneNumber}</strong>
                        </p>
                    </div>

                    {/* OTP Form */}
                    <form onSubmit={handleVerifyOTP} className="otp-form">
                        <div className="form-group">
                            <input
                                type="text"
                                className="otp-input"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                        >
                            Verify & Login
                        </Button>
                    </form>

                    {/* Resend OTP */}
                    <div className="otp-footer">
                        {timer > 0 ? (
                            <p className="timer-text">
                                Resend OTP in <strong>{timer}s</strong>
                            </p>
                        ) : (
                            <button
                                onClick={handleResendOTP}
                                className="resend-btn"
                                disabled={resendLoading}
                            >
                                {resendLoading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OTPVerify;
