// const mongoose = require('mongoose');

// const questionSchema = new mongoose.Schema({
//   courseId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course',
//     required: true,
//   },
//   levelId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Level',
//     required: true,
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   questionType: {
//     type: String,
//     enum: ['mcq'],
//     default: 'mcq',
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   mcqAnswers: [
//     {
//       text: { type: String, required: true },
//       isCorrect: { type: Boolean, required: true },
//     },
//   ],
// }, {
//   timestamps: true,
// });



// const Question = mongoose.model('Question', questionSchema);
// module.exports = Question;















const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionType: {
    type: String,
    enum: ['mcq', 'audio'],
    default: 'mcq',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  mcqAnswers: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  audioAnswer: {
    audioUrl: { type: String },
    transcript: { type: String },
  },
}, {
  timestamps: true,
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
