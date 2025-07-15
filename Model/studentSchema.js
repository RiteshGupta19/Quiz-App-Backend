const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      match: /^\d+$/,
      unique: true,
    },
    eMail: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Fixed email regex
      lowercase: true,
      trim: true,
    },
    courseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    isEnrolled: {
      type: Boolean,
      default: false,
    },
    registeredDate: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique mobile number per user
studentSchema.index({ mobileNo: 1, userId: 1 }, { unique: true });
// Compound index for unique email per user
studentSchema.index({ eMail: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
