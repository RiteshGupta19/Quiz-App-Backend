const mongoose = require('mongoose');

const authSchema = new mongoose.Schema(
  {
    mobileNo: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiration: {
      type: String,
    },
    lastActive: {
      type: Date,
    },
    deviceInfo: {
      type: Object, 
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('auth', authSchema);
