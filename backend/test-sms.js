import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const smsClient = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH
);

async function testSMS() {
    console.log("Testing Twilio with following config:");
    console.log("SID:", process.env.TWILIO_SID);
    console.log("From:", process.env.TWILIO_PHONE_NUMBER);

    try {
        const message = await smsClient.messages.create({
            body: `Test OTP: 123456`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: '+919876543210' // Replace with your number or a known number
        });

        console.log("Success! SID:", message.sid);
    } catch (error) {
        console.log("Detailed Error:");
        console.log("Status:", error.status);
        console.log("Code:", error.code);
        console.log("Message:", error.message);
        console.log("More info:", error.moreInfo);
    }
}

testSMS();
