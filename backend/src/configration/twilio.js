import twilio from "twilio";

let client = null;

export const getSmsClient = () => {
  if (!client) {
    const sid = process.env.TWILIO_SID;
    const auth = process.env.TWILIO_AUTH;

    console.log("DEBUG: Initializing Twilio client...");
    console.log("DEBUG: TWILIO_SID present:", !!sid, sid ? `(${sid.substring(0, 5)}...)` : "(missing)");
    console.log("DEBUG: TWILIO_AUTH present:", !!auth, auth ? "(present)" : "(missing)");

    if (!sid || !auth) {
      console.error("❌ Twilio credentials missing in environment!");
    }
    client = twilio(sid, auth);
  }
  return client;
};
