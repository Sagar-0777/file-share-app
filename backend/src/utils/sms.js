import { smsClient } from "../configration/twilio.js";

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via SMS to the given phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +1234567890)
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTP = async (phoneNumber, otp) => {
    try {
        const message = await smsClient.messages.create({
            body: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log(`OTP sent to ${phoneNumber}: ${message.sid}`);
        return { success: true, messageSid: message.sid };
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP. Please check the phone number.");
    }
};

/**
 * Send download link via SMS to receiver
 * @param {string} phoneNumber - Receiver's phone number
 * @param {string} senderName - Name of the person sharing the file
 * @param {string} fileName - Name of the file being shared
 * @param {string} downloadLink - Public download link
 */
export const sendDownloadLink = async (
    phoneNumber,
    senderName,
    fileName,
    downloadLink
) => {
    try {
        const message = await smsClient.messages.create({
            body: `${senderName} shared a file with you!\n\nFile: ${fileName}\n\nDownload: ${downloadLink}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log(`Download link sent to ${phoneNumber}: ${message.sid}`);
        return { success: true, messageSid: message.sid };
    } catch (error) {
        console.error("Error sending download link:", error);
        throw new Error("Failed to send download link notification.");
    }
};
