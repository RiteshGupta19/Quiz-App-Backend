const express = require('express');
const { sendOtp, verifyOtp, refreshToken } = require('../Controller/authController');
const { submitAnswer, getAnswersByStudentAndCourse } = require('../Controller/studentAppController');
const appRouter = express.Router();


// Auth 

appRouter.post('/send-otp',sendOtp);
appRouter.post('/verify-otp',verifyOtp);
appRouter.post('/refresh-token',refreshToken);


// Student 

appRouter.post('/submit-answer', submitAnswer);
appRouter.get('/answers/:studentId/:courseId/:levelId', getAnswersByStudentAndCourse);

module.exports = appRouter;
