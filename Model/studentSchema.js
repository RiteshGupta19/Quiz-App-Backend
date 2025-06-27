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
    courseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    // courses: [
    //   {
    //     courseId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'Course',
    //     },
    //     registrationDate: {
    //       type: Date,
    //       default: Date.now, 
    //     }
    //   }
    // ],
    isEnrolled: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model('Student', studentSchema);
