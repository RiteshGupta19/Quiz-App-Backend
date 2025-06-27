const QALevel = require('../Model/QALevelSchema');

// POST /api/course-levels
exports.createQACourseLevel = async (req, res) => {
  try {
    const { courseId, title, desc, topics, level } = req.body;

    // Validation
    if (!courseId || !title || !desc || !topics || !level) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // 🚫 Check if level already exists for this course
    const existingLevel = await QALevel.findOne({ courseId, level });
    if (existingLevel) {
      return res.status(409).json({ message: `${level} level already exists for this course.` });
    }

    // ✅ Create new document
    const newLevel = new QALevel({
      courseId,
      title,
      desc,
      topics,
      level,
    });

    const savedLevel = await newLevel.save();
    res.status(201).json({
      message: 'Level created successfully',
      data: savedLevel,
    });
  } catch (err) {
    console.error('Error creating course level:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getCourseLevelsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    const levels = await QALevel.find({ courseId });

    if (!levels.length) {
      return res.status(404).json({ message: 'No Q&A found for this course' });
    }

    res.status(200).json({
      message: 'Levels fetched successfully',
      data: levels
    });
  } catch (err) {
    console.error('Error fetching levels:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
