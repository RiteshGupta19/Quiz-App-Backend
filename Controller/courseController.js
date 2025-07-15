const Course = require('../Model/courseSchema');
const { courseValidation, updateCourseValidation } = require('../validator/courseValidation');
const Level = require('../Model/levelSchema')



const getlevels = async (req, res) => {
  try {
    // console.log('cdfcdc');
    const levels = await Level.find().sort({ order: 1 });
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
};


const createCourse = async (req, res) => {
  // Normalize and validate
  const { error, value } = courseValidation.validate(req.body, { convert: true });

  if (error) { 
    return res.status(400).json({ error: error.details[0].message });
  }

  const { courseName, userId, levelIds } = value;

  try {
    // Check for duplicate course name
    const existingCourse = await Course.findOne({ courseName: new RegExp(`^${courseName}$`, 'i'), userId });
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


const getCourses = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    // console.log("User ID:", userId);

    const courses = await Course.find({ userId }) // 🔥 filter courses created by this user
      .populate({
        path: 'levelIds',
        model: 'Level',
        select: 'title order' 
      })
      .sort({ courseName: 1 });

    res.status(200).json(courses, userId);
  } catch (err) {
    console.error('Error fetching courses:', err.message);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};



const updateCourse = async (req, res) => {
  const { courseId } = req.params;

  const { error, value } = updateCourseValidation.validate(req.body, { convert: true });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { courseName, levelIds } = value;

  try {
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const duplicate = await Course.findOne({
      courseName: new RegExp(`^${courseName}$`, 'i'),
      userId: existingCourse.userId, 
      _id: { $ne: courseId }
    });

    if (duplicate) {
      return res.status(400).json({ error: 'Course name already in use' });
    }

    existingCourse.courseName = courseName;
    existingCourse.levelIds = levelIds;

    await existingCourse.save();

    return res.status(200).json({ message: 'Course updated successfully', course: existingCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
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
  getlevels,
  createCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  getLevelsByCourseId,
  getCompletionStatus
};
