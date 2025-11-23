import admin from "../firebase.js";

export const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    let user;
    try {
      user = await admin.auth().getUserByPhoneNumber(phoneNumber);
    } catch {
      user = await admin.auth().createUser({ phoneNumber });
    }

    const token = await admin.auth().createCustomToken(user.uid);

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
