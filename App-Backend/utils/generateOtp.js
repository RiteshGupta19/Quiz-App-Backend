const Auth = require('../Model/authSchema'); 

const generateUniqueOtp = async () => {
  let otp;
  let isUnique = false;

  while (!isUnique) {
    otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random OTP
    const existingOtp = await Auth.findOne({ otp });
    if (!existingOtp) {
      isUnique = true;
    }
  }

  return otp.toString();
};

module.exports = generateUniqueOtp;