const mongoose = require('mongoose'); 

const  QALevelSchema = new mongoose.Schema({ 
  courseId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming it links to a Course collection
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  topics: [
    {
      type: String,
      required: true,
    }
  ],
  level: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    required: true,
  }
});

module.exports = mongoose.model('QA-Level',  QALevelSchema); 