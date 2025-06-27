const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  levelIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
    }
  ],
}, {
  timestamps: true, 
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
