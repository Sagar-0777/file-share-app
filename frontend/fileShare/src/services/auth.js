import api from './api';

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number to send OTP to
 * @returns {Promise} API response
 */
export const sendOTP = async (phoneNumber) => {
    const response = await api.post('/auth/send-otp', { phoneNumber });
    return response.data;
};

/**
 * Verify OTP and login
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP code
 * @returns {Promise} API response with token and user data
 */
export const verifyOTP = async (phoneNumber, otp, name) => {
    const response = await api.post('/auth/verify-otp', { phoneNumber, otp, name });
    return response.data;
};

/**
 * Get user profile
 * @returns {Promise} User profile data
 */
export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

/**
 * Update user profile
 * @param {Object} data - Profile data to update
 * @returns {Promise} Updated user data
 */
export const updateProfile = async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
};
