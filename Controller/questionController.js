const Question = require('../Model/questionSchema');
const { questionValidation } = require('../validator/questionValidation');

const {uploadImageToGCS, getSignedUrl} = require('../utils/gcpMethod')


// const createQuestion = async (req, res) => {
//   try {
//     const { error } = questionValidation.validate(req.body);
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const question = new Question(req.body);
//     await question.save();

//     res.status(201).json({
//       message: 'Question created successfully',
//       data: question,
//     });
//   } catch (err) {
//     console.error('Error creating question:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



const createQuestion = async (req, res) => {

console.log("req.file", req.file); // Confirm multer received file
console.log("req.body", req.body); // Confirm all fields are present


  try {
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





// const getQuestionsByCourseAndLevel = async (req, res) => {
//   try {
//     const { courseId, levelId } = req.params;

//     if (!courseId || !levelId) {
//       return res.status(400).json({ message: 'courseId and levelId are required' });
//     }

//     const questions = await Question.find({
//       courseId,
//       levelId,
//     });

//     res.status(200).json({
//       message: 'Questions fetched successfully',
//       data: questions,
//     });
//   } catch (err) {
//     console.error('Error fetching questions:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


const getQuestionsByCourseAndLevel = async (req, res) => {
  try {
    const { courseId, levelId } = req.params;

    if (!courseId || !levelId) {
      return res.status(400).json({ message: 'courseId and levelId are required' });
    }

    const questions = await Question.find({ courseId, levelId });

    
// console.log('questions', questions)

    // Process signed URLs for audio questions
    const updatedQuestions = await Promise.all(
      questions.map(async (q) => {
        if (q.questionType === 'audio' && q.audioAnswer?.audioUrl) {
          const signedUrl = await getSignedUrl(q.audioAnswer.audioUrl);
          return {
            ...q.toObject(),
            audioAnswer: {
              ...q.audioAnswer,
              signedUrl,
            },
          };
        }
        return q;
      })
    );

// console.log('updatedQuestions', updatedQuestions)

    res.status(200).json({
      message: 'Questions fetched successfully',
      data: updatedQuestions,
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




module.exports = { createQuestion, getQuestionsByCourseAndLevel };
