const Course = require('../Model/courseSchema');
const { courseValidation } = require('../validator/courseValidation');
const Level = require('../Model/levelSchema')


// const createCourse = async (req, res) => {
//   const { courseName, userId, levelIds } = req.body;

// console.log('course.body', req.body)


//   if (!courseName || !userId || !Array.isArray(levelIds)) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   try {
//     const newCourse = new Course({
//       courseName,
//       userId,
//       levelIds
//     });

//     await newCourse.save();

//     return res.status(201).json({ message: 'Course created successfully', course: newCourse });
//   } catch (error) {
//     console.error('Error creating course:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


const createCourse = async (req, res) => {
  // Normalize and validate
  const { error, value } = courseValidation.validate(req.body, { convert: true });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { courseName, userId, levelIds } = value;

  try {
    // Check for duplicate course name
    const existingCourse = await Course.findOne({ courseName: new RegExp(`^${courseName}$`, 'i') });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course name already exists' });
    }

    const newCourse = new Course({
      courseName,
      userId,
      levelIds
    });

    await newCourse.save();

    return res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




const getLevelsByCourseId = async (req, res) => {
  const { courseId } = req.params;

// console.log('courseId', courseId)


  if (!courseId) {
    return res.status(400).json({ error: 'Invalid or missing course ID' });
  }

  try {
    const course = await Course.findById(courseId).populate('levelIds');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

// console.log('course', course)

    return res.status(200).json({ levels: course.levelIds });
  } catch (error) {
    console.error('Error fetching levels by course ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

getCompletionStatus = async (req, res) => {
  const { studentId, courseId } = req.params;

  try {
    const levels = await Level.find({ _id: { $in: (await Course.findById(courseId)).levelIds } });

    const questions = await Question.find({ courseId });
    const answers = await Answer.find({ studentId, courseId });

    const levelMap = {};

    for (let level of levels) {
      const levelQuestions = questions.filter(q => q.levelId.toString() === level._id.toString());
      const levelAnswers = answers.filter(a => a.levelId.toString() === level._id.toString());

      levelMap[level._id] = (
        levelQuestions.length > 0 &&
        levelQuestions.length === levelAnswers.length
      );
    }

    res.status(200).json({ completedLevels: levelMap });
  } catch (err) {
    console.error('Error in completion status API:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  createCourse,
  getLevelsByCourseId,
  getCompletionStatus
};
