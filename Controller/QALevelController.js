const QALevel = require("../Model/QALevelSchema");

// POST /api/course-levels
exports.createQACourseLevel = async (req, res) => {
  try {
    const { courseId, title, desc, topics, level } = req.body;

    // Validation
    if (!courseId || !title || !desc || !topics || !level) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 🚫 Check if level already exists for this course
    const existingLevel = await QALevel.findOne({ courseId, level });
    if (existingLevel) {
      return res
        .status(409)
        .json({ message: `${level} level already exists for this course.` });
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
      message: "Level created successfully",
      data: savedLevel,
    });
  } catch (err) {
    console.error("Error creating course level:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getCourseLevelsByCourseId = async (req, res) => {
  try {

    const { courseId } = req.params;

    const levels = await QALevel.find({ courseId });


    // if (!levels.length) {
    //   return res.status(404).json({ message: 'No Q&A found for this course' });
    // }

    return res.status(200).json({
      message: !levels.length == "No Q&A levels for this course",
      data: levels,
    });

    // res.status(200).json({
    //   message: 'Levels fetched successfully',
    //   data: levels
    // });
  } catch (err) {
    console.error("Error fetching levels:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getQALevelById = async (req, res) => {
  try {

    const { qnaId } = req.params;

    const level = await QALevel.findById(qnaId).populate('courseId', 'courseName');
    
    if (!level) {
      return res.status(404).json({ message: 'QA Level not found' });
    }

    res.status(200).json({
      data: level
    });
  } catch (err) {
    console.error("Error fetching QA level:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update QA level
exports.updateQALevel = async (req, res) => {
  try {
    const { qnaId } = req.params;
    const { courseId, title, desc, topics, level } = req.body;

    // Validation
    if (!courseId || !title || !desc || !topics || !level) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the level already exists for this course (excluding current document)
    const existingLevel = await QALevel.findOne({ 
      courseId, 
      level, 
      _id: { $ne: qnaId } 
    });
    
    if (existingLevel) {
      return res.status(409).json({ 
        message: `${level} level already exists for this course.` 
      });
    }

    // Update the document
    const updatedLevel = await QALevel.findByIdAndUpdate(
      qnaId,
      {
        courseId,
        title,
        desc,
        topics,
        level
      },
      { new: true, runValidators: true }
    );

    if (!updatedLevel) {
      return res.status(404).json({ message: 'QA Level not found' });
    }

    res.status(200).json({
      message: 'QA Level updated successfully',
      data: updatedLevel
    });
  } catch (err) {
    console.error("Error updating QA level:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete QA level
exports.deleteQALevel = async (req, res) => {
  try {
    const { qnaId } = req.params;
    const deletedLevel = await QALevel.findByIdAndDelete(qnaId);

    if (!deletedLevel) {
      return res.status(404).json({ message: 'QA Level not found' });
    }

    res.status(200).json({
      message: 'QA Level deleted successfully',
      data: deletedLevel
    });
  } catch (err) {
    console.error("Error deleting QA level:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all QA levels (for listing page)
exports.getAllQALevels = async (req, res) => {
  try {
    const levels = await QALevel.find()
      .populate('courseId', 'courseName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: levels
    });
  } catch (err) {
    console.error("Error fetching QA levels:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
