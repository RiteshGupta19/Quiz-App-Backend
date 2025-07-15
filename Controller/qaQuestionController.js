const QAQuestion = require('../Model/qnaSchema');

// POST /api/qa-question
exports.createQAQuestion = async (req, res) => {
  try {
    const { courseId, levelId, question, answer } = req.body;

    // Validation
    if (!courseId || !levelId || !question || !answer) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newQA = new QAQuestion({
      courseId,
      levelId,
      question,
      answer,
    });

    const saved = await newQA.save();

    res.status(201).json({
      message: 'Q&A added successfully',
      data: saved,
    });
  } catch (err) {
    console.error('Error creating QA:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getQuestionsByLevelId = async (req, res) => {
  try {
     const { courseId, levelId } = req.params;

    const questions = await QAQuestion.find({ courseId, levelId });

    if (!questions.length) {
      return res.status(404).json({ message: 'No questions found for this level.' });
    }
    // console.log('objectques',questions);
    res.status(200).json({
      message: 'Questions fetched successfully',
      data: questions,
    });
  } catch (err) {
    console.error('Error fetching QAs:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// GET /api/qa-questions - Get all questions with populated course and level data
exports.getAllQAQuestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    // If no userId, return empty array
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // First get all courses for this user
    const Course = require('../Model/courseSchema'); // Adjust path as needed
    const userCourses = await Course.find({ userId }).select('_id');
    const userCourseIds = userCourses.map(course => course._id);

    // Then get questions only for user's courses
    const questions = await QAQuestion.find({ courseId: { $in: userCourseIds } })
      .populate('courseId', 'courseName')
      .populate('levelId', 'title')
      .sort({ createdAt: -1 });

    // Return the questions array directly
    res.status(200).json(questions);

  } catch (err) {
    console.error('❌ Error fetching all QA questions:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/qa-questions/:id - Get single question by ID
exports.getQAQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await QAQuestion.findById(id)
      .populate('courseId', 'courseName')
      .populate('levelId', 'title');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      // message: 'Question fetched successfully',
      data: question,
    });
  } catch (err) {
    console.error('Error fetching QA question:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/qa-questions/:id - Update question
exports.updateQAQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, levelId, question, answer } = req.body;

    // Validation
    if (!courseId || !levelId || !question || !answer) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const updatedQuestion = await QAQuestion.findByIdAndUpdate(
      id,
      {
        courseId,
        levelId,
        question,
        answer,
      },
      { new: true, runValidators: true }
    )
      .populate('courseId', 'courseName')
      .populate('levelId', 'title');

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      message: 'Question updated successfully',
      data: updatedQuestion,
    });
  } catch (err) {
    console.error('Error updating QA question:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/qa-questions/:id - Delete question
exports.deleteQAQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuestion = await QAQuestion.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      message: 'Question deleted successfully',
      data: deletedQuestion,
    });
  } catch (err) {
    console.error('Error deleting QA question:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};