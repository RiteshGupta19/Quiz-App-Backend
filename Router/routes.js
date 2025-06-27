const express = require('express')
const Router = express.Router();
const {signUp, signIn, refreshAccessToken, getUserData} = require('../Controller/authController')
const {authMiddleware} = require('../Middleware/authMiddleware');

const { createStudent, getStudentDetails } = require('../Controller/studentController');
const { createCourse, getLevelsByCourseId } = require('../Controller/courseController');
const { createQuestion, getQuestionsByCourseAndLevel } = require('../Controller/questionController');

const audioUpload = require('../Middleware/audioMiddleware');
const { createQACourseLevel, getCourseLevelsByCourseId } = require('../Controller/QALevelController');
const { createQAQuestion, getQuestionsByLevelId } = require('../Controller/qaQuestionController');


// AUTH


Router.post('/sign-up', signUp)
Router.post('/sign-in', signIn)
Router.get('/users/profile', authMiddleware, getUserData);
Router.get('/refresh-token', refreshAccessToken);


// STUDENT

Router.post('/create-student', createStudent);
Router.get('/app/students/:mobileNo', getStudentDetails);

// COURSE

Router.post('/create-course', createCourse);
Router.get('/app/levels/:courseId', getLevelsByCourseId);

// QUESTION 

// Router.post('/create-question', createQuestion);

Router.post('/create-question', audioUpload.single('file'), createQuestion);
Router.get('/app/questions/:courseId/:levelId', getQuestionsByCourseAndLevel);

// QUESTION & Answers
Router.post('/qa-level', createQACourseLevel);
Router.get('/app/qa-level/:courseId', getCourseLevelsByCourseId);

Router.post('/qa-questions', createQAQuestion);
Router.get('/app/qa-questions/:courseId/:levelId', getQuestionsByLevelId);

module.exports = Router;