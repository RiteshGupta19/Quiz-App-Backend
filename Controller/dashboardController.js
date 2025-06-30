const Student = require('../Model/studentSchema');
const Course = require('../Model/courseSchema');
const Level = require('../Model/levelSchema');
const Question = require('../Model/questionSchema');
const Answer = require('../App-Backend/Model/TrackAnswerSchema');
const QALevel = require('../Model/QALevelSchema');

exports.getDashboardData = async (req, res) => {
  try {
    const { studentId } = req.params;
    // console.log(`📥 Dashboard API called for studentId: ${studentId}`);

    // 1. Fetch student
    const student = await Student.findById(studentId).populate('courseIds');
    if (!student) {
      // console.warn('⚠️ Student not found');
      return res.status(404).json({ message: 'Student not found' });
    }

    // console.log(`👤 Student found: ${student.name}, Courses: ${student.courseIds.length}`);

    const dashboardData = [];

    // 2. Loop through each course
    for (const course of student.courseIds) {
      const courseId = course._id;
      // console.log(`📚 Processing course: ${course.courseName}`);

      // 3. Get levels
      const levels = await Level.find({ _id: { $in: course.levelIds } }).sort({ order: 1 });
      // console.log(`📑 Found ${levels.length} levels`);

      // 4. Get Q&A levels
      const qaLevels = await QALevel.find({ courseId });
      // console.log(`💬 Found ${qaLevels.length} QnA levels`);

      let completedCount = 0;

      for (const level of levels) {
        const [questions, answers] = await Promise.all([
          Question.find({ courseId, levelId: level._id }),
          Answer.find({ studentId, courseId, levelId: level._id }),
        ]);

        // console.log(`🔍 Level: ${level.title} | Questions: ${questions.length} | Answers: ${answers.length}`);

        if (questions.length > 0 && answers.length === questions.length) {
          completedCount++;
        }
      }

      dashboardData.push({
        courseId,
        courseName: course.courseName,
        totalLevels: levels.length,
        completedLevels: completedCount,
        qaLevels: qaLevels.sort((a, b) => {
          const order = ['basic', 'intermediate', 'advanced'];
          return order.indexOf(a.level) - order.indexOf(b.level);
        }),
      });

      // console.log(`✅ Course: ${course.courseName} | Progress: ${completedCount}/${levels.length}`);
    }

    // console.log('🎯 Final dashboard data ready. Sending to client...');
    return res.status(200).json({
      studentName: student.name,
      createdAt: student.createdAt,
      courses: dashboardData,
    });

  } catch (err) {
    console.error('❌ Error in dashboard API:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};