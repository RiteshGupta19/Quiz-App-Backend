const express = require('express')
const Router = express.Router();
const {signUp, signIn, refreshAccessToken, getUserData} = require('../Controller/authController')
const {authMiddleware} = require('../Middleware/authMiddleware');

const { createStudent, getStudentDetails, getAllStudents, getStudentById, updateStudent, deleteStudent } = require('../Controller/studentController');
const { createCourse, getLevelsByCourseId, getlevels, getCourses, deleteCourse, updateCourse } = require('../Controller/courseController');
const { createQuestion, getQuestionsByCourseAndLevel, getQuestionTypes, getAllQuestions, deleteQuestion, getQuestionById, updateQuestion } = require('../Controller/questionController');

const audioUpload = require('../Middleware/audioMiddleware');
const { createQACourseLevel, getCourseLevelsByCourseId, deleteQALevel, updateQALevel, getQALevelById, getAllQALevels } = require('../Controller/QALevelController');
const { createQAQuestion, getQuestionsByLevelId, deleteQAQuestion, updateQAQuestion, getQAQuestionById, getAllQAQuestions } = require('../Controller/qaQuestionController');
const { getDashboardData } = require('../Controller/dashboardController');
const { getLevelCompletionStatus } = require('../Controller/getLevelCompletionStatus');


// AUTH


Router.post('/sign-up', signUp)
Router.post('/sign-in', signIn)
Router.get('/users/profile', authMiddleware, getUserData);
Router.get('/refresh-token', refreshAccessToken);

//Dashboard
Router.get('/app/dashboard/:studentId', getDashboardData);


// STUDENT
Router.get('/levels', getlevels)
Router.post('/create-student',authMiddleware, createStudent);
Router.get('/app/students/:mobileNo', getStudentDetails);
Router.get('/students', authMiddleware, getAllStudents);
Router.get('/student/:id', authMiddleware, getStudentById);
Router.put('/update-student/:id', authMiddleware, updateStudent);
Router.delete('/delete-student/:id', authMiddleware, deleteStudent);

// COURSE

Router.post('/create-course', createCourse);
Router.get('/courses',authMiddleware, getCourses);
Router.get('/app/levels/:courseId', getLevelsByCourseId);
Router.put('/courses/:courseId',authMiddleware, updateCourse);
Router.delete('/courses/:courseId', deleteCourse);

// QUESTION 

// Router.post('/create-question', createQuestion);
Router.get('/question-types', getQuestionTypes);
Router.post('/create-question', audioUpload.single('file'), createQuestion);
Router.get('/app/questions/:courseId/:levelId', getQuestionsByCourseAndLevel);

// QUIZ/QUESTION MANAGEMENT ROUTES
Router.get('/get-all-questions', authMiddleware, getAllQuestions);
Router.delete('/delete-question/:questionId', authMiddleware, deleteQuestion);
Router.get('/questions/:questionId', authMiddleware, getQuestionById);
Router.put('/questions/:questionId', authMiddleware, audioUpload.single('file'), updateQuestion);

// QUESTION & Answers
Router.post('/qa-level', createQACourseLevel);
Router.get('/app/qa-level/:courseId', getCourseLevelsByCourseId);
Router.get('/qa-levels', getAllQALevels);              // Get all QA levels
Router.get('/qa-level/:qnaId', getQALevelById);        // Get single QA level
Router.put('/qa-level/:qnaId', updateQALevel);         // Update QA level
Router.delete('/delete-qa-level/:qnaId', deleteQALevel); 



Router.post('/qa-questions', createQAQuestion);
Router.get('/app/qa-questions/:courseId/:levelId', getQuestionsByLevelId);
Router.get('/qa-questions', authMiddleware, getAllQAQuestions);                           // Get all Q&A (new)
Router.get('/qa-questions/:id', getQAQuestionById);                       // Get single Q&A (new)
Router.put('/qa-questions/:id', updateQAQuestion);                        // Update Q&A (new)
Router.delete('/qa-questions/:id', deleteQAQuestion);  
// Router.get('/app/qa-level/:courseId', getLevelsByCourse);
// 
//Final Complition status

Router.get('/app/completion-status/:studentId/:courseId', getLevelCompletionStatus);


module.exports = Router;