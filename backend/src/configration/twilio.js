import twilio from "twilio";

export const smsClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);
