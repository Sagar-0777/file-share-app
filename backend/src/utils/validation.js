/**
 * Normalize phone number to E.164 format
 * @param {string} phone - Input phone number
 * @returns {string|null} Normalized phone number or null if invalid
 */
export const normalizePhoneNumber = (phone) => {
    if (!phone) return null;

    // Remove all non-numeric characters except leading +
    let cleaned = phone.trim().replace(/[^\d+]/g, "");

    // If it doesn't start with +, assume it needs one
    if (!cleaned.startsWith("+")) {
        cleaned = `+${cleaned}`;
    }

    // Basic length check (min 7 digits after +, max 15)
    // Twilio generally requires at least a country code and a number
    if (cleaned.length < 8 || cleaned.length > 16) {
        return null;
    }

    return cleaned;
};
