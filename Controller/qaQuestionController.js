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
    console.log('objectques',questions);
    res.status(200).json({
      message: 'Questions fetched successfully',
      data: questions,
    });
  } catch (err) {
    console.error('Error fetching QAs:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
