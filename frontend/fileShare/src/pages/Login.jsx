import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOTP } from '../services/auth';
import { validatePhoneNumber } from '../utils/validation';
import Button from '../components/Button';
import { FaPhone, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/');
        return null;
    }

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!validatePhoneNumber(phoneNumber)) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const response = await sendOTP(phoneNumber);
            if (response.success) {
                toast.success('OTP sent successfully!');
                navigate('/verify-otp', { state: { phoneNumber } });
            }
        } catch (error) {
            toast.error(error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-card glass">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-icon">
                            <FaLock />
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue sharing files</p>
                    </div>

                    {/* OTP Login Form */}
                    <form onSubmit={handleSendOTP} className="login-form">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-with-icon">
                                <FaPhone className="input-icon" />
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="+1234567890"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <small className="form-hint">
                                Enter your phone number to receive an OTP
                            </small>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                        >
                            Send OTP
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="login-bg-decoration"></div>
            </motion.div>
        </div>
    );
};

export default Login;
