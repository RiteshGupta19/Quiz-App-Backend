const Question = require('../Model/questionSchema');
const Answer = require('../App-Backend/Model/TrackAnswerSchema');
const Course = require('../Model/courseSchema');
const Level = require('../Model/levelSchema');

const getLevelCompletionStatus = async (req, res) => {
  const { studentId, courseId } = req.params;

  // console.log(`📥 Completion Status API called`);
  // console.log(`👤 Student ID: ${studentId}`);
  // console.log(`📘 Course ID: ${courseId}`);

  try {
    const course = await Course.findById(courseId).populate('levelIds');
    if (!course) {
      // console.warn('❌ Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }

    const levels = course.levelIds;
    // console.log(`📚 Found ${levels.length} levels in course: ${course.courseName}`);

    // Fetch all questions and answers for the course
    const allQuestions = await Question.find({ courseId });
    const allAnswers = await Answer.find({ studentId, courseId });

    // console.log(`❓ Total questions found: ${allQuestions.length}`);
    // console.log(`✅ Total answers found for student: ${allAnswers.length}`);

    const levelCompletion = {};

    levels.forEach((level) => {
      const levelId = level._id.toString();
      const questionsInLevel = allQuestions.filter(q => q.levelId.toString() === levelId);
      const answersInLevel = allAnswers.filter(a => a.levelId.toString() === levelId);

      const isCompleted = questionsInLevel.length > 0 && questionsInLevel.length === answersInLevel.length;

      // console.log(`📑 Level: ${level.title} | Questions: ${questionsInLevel.length} | Answers: ${answersInLevel.length} | ✅ Completed: ${isCompleted}`);

      levelCompletion[levelId] = isCompleted;
    });

    // console.log('📦 Final completion map:', levelCompletion);

    res.status(200).json({
      courseId,
      completedLevels: levelCompletion,
    });

  } catch (error) {
    console.error('❌ Error in level completion status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getLevelCompletionStatus
};
