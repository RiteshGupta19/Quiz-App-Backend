const Question = require('../Model/questionSchema');
const { questionValidation } = require('../validator/questionValidation');
const {uploadImageToGCS, getSignedUrl} = require('../utils/gcpMethod')




const getQuestionTypes = (req, res) => {
  const types = Question.schema.path('questionType').enumValues;
  // Format the types for react-select
  const formattedTypes = types.map(type => ({
    label: type.toUpperCase(),
    value: type
  }));
  res.status(200).json(formattedTypes);
};

const createQuestion = async (req, res) => {
  try {
    if (req.body.mcqAnswers && typeof req.body.mcqAnswers === 'string') {
      try {
        req.body.mcqAnswers = JSON.parse(req.body.mcqAnswers);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid format for mcqAnswers' });
      }
    }
    
    const { error } = questionValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      courseId,
      levelId,
      userId,
      questionType,
      title,
      mcqAnswers,
      transcript,
    } = req.body;

    let audioUrl = null;

    if (questionType === 'audio') {
      if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required for audio questions' });
      }

      if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required for audio questions' });
      }

      try {
        audioUrl = await uploadImageToGCS(req.file, "audioUpload/", userId);
      } catch (error) {
        console.error("GCS Upload Error:", error);
        return res.status(500).json({ message: "Failed to upload file to GCS" });
      }
    }

    const questionData = {
      courseId,
      levelId,
      userId,
      questionType,
      title,
      mcqAnswers: questionType === 'mcq' ? mcqAnswers : [],
    };

    if (questionType === 'audio') {
      questionData.audioAnswer = {
        audioUrl,
        transcript,
      };
    }

    const question = new Question(questionData);
    await question.save();

    res.status(201).json({
      message: 'Question created successfully',
      data: question,
    });
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    
    const questions = await Question.find({ userId })
      .populate('courseId', 'courseName')
      .populate('levelId', 'title')
      .sort({ createdAt: -1 });

    // Process signed URLs for audio questions
    const updatedQuestions = await Promise.all(
      questions.map(async (q) => {
        if (q.questionType === 'audio' && q.audioAnswer?.audioUrl) {
          try {
            const signedUrl = await getSignedUrl(q.audioAnswer.audioUrl);
            return {
              ...q.toObject(),
              audioAnswer: {
                ...q.audioAnswer,
                signedUrl,
              },
            };
          } catch (error) {
            console.error('Error getting signed URL:', error);
            return q.toObject();
          }
        }
        return q.toObject();
      })
    );

    res.status(200).json(updatedQuestions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuestionById = async (req, res) => {
  try {
    console.log('object');
    const { questionId } = req.params;
    const userId = req.user.userId;
    const question = await Question.findOne({ _id: questionId, userId })
      .populate('courseId', 'courseName')
      .populate('levelId', 'title');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let questionData = question.toObject();

    // Process signed URL for audio question
    if (question.questionType === 'audio' && question.audioAnswer?.audioUrl) {
      try {
        const signedUrl = await getSignedUrl(question.audioAnswer.audioUrl);
        questionData.audioAnswer = {
          ...question.audioAnswer,
          signedUrl,
        };
      } catch (error) {
        console.error('Error getting signed URL:', error);
      }
    }

    res.status(200).json(questionData);
  } catch (err) {
    console.error('Error fetching question:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.userId;

    if (req.body.mcqAnswers && typeof req.body.mcqAnswers === 'string') {
      try {
        req.body.mcqAnswers = JSON.parse(req.body.mcqAnswers);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid format for mcqAnswers' });
      }
    }
    req.body.userId = userId; 
    console.log('ercecec',req.body);
    const { error } = questionValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const question = await Question.findOne({ _id: questionId, userId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const {
      courseId,
      levelId,
      questionType,
      title,
      mcqAnswers,
      transcript,
    } = req.body;

    let audioUrl = question.audioAnswer?.audioUrl;

    // Handle audio file upload for audio questions
    if (questionType === 'audio') {
      if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required for audio questions' });
      }

      if (req.file) {
        try {
          audioUrl = await uploadImageToGCS(req.file, "audioUpload/", userId);
        } catch (error) {
          console.error("GCS Upload Error:", error);
          return res.status(500).json({ message: "Failed to upload file to GCS" });
        }
      }
    }

    const updateData = {
      courseId,
      levelId,
      questionType,
      title,
      mcqAnswers: questionType === 'mcq' ? mcqAnswers : [],
    };

    if (questionType === 'audio') {
      updateData.audioAnswer = {
        audioUrl,
        transcript,
      };
    } else {
      updateData.audioAnswer = undefined;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Question updated successfully',
      data: updatedQuestion,
    });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.userId;

    const question = await Question.findOne({ _id: questionId, userId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Question.findByIdAndDelete(questionId);

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuestionsByCourseAndLevel = async (req, res) => {
  try {
    const { courseId, levelId } = req.params;

    if (!courseId || !levelId) {
      return res.status(400).json({ message: 'courseId and levelId are required' });
    }

    const questions = await Question.find({ courseId, levelId });

    // Process signed URLs for audio questions
    const updatedQuestions = await Promise.all(
      questions.map(async (q) => {
        if (q.questionType === 'audio' && q.audioAnswer?.audioUrl) {
          try {
            const signedUrl = await getSignedUrl(q.audioAnswer.audioUrl);
            return {
              ...q.toObject(),
              audioAnswer: {
                ...q.audioAnswer,
                signedUrl,
              },
            };
          } catch (error) {
            console.error('Error getting signed URL:', error);
            return q.toObject();
          }
        }
        return q.toObject();
      })
    );

    res.status(200).json({
      message: 'Questions fetched successfully',
      data: updatedQuestions,
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getQuestionTypes,
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCourseAndLevel,
};
