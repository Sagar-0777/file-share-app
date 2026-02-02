import { getSmsClient } from "../configration/twilio.js";

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
        const client = getSmsClient();
        const message = await client.messages.create({
            body: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log(`OTP sent to ${phoneNumber}: ${message.sid}`);
        return { success: true, messageSid: message.sid };
    } catch (error) {
        console.error("Twilio Error Details:", {
            code: error.code,
            status: error.status,
            message: error.message
        });

        // Handle Twilio Trial account restriction (Error 21608)
        if (String(error.code) === '21608') {
            throw new Error("Twilio Trial Error: The destination phone number is not verified in your Twilio Console. Please verify it at https://console.twilio.com/us1/receiver-numbers/verified-caller-ids");
        }

        throw new Error(error.message || "Failed to send OTP. Please check the phone number.");
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
        const client = getSmsClient();
        const message = await client.messages.create({
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
