
const TrackAnswer = require('../Model/TrackAnswerSchema');
const Question = require('../../Model/questionSchema');

// const submitAnswer = async (req, res) => {
//   try {
//     const {
//       studentId,
//       questionId,
//       answerId, 
//     } = req.body;


// console.log(req.body)

//    const existing = await TrackAnswer.findOne({ studentId, questionId });
//     if (existing) {
//       return res.status(409).json({
//         message: 'You have already submitted an answer for this question.',
//       });
//     }


//     const question = await Question.findById(questionId);
//     if (!question) {
//       return res.status(404).json({ message: 'Question not found' });
//     }

 


//     // console.log('question', question)


//     const selectedAnswer = question.mcqAnswers.find(ans => ans._id.toString() === answerId);
//     if (!selectedAnswer) {
//       return res.status(400).json({ message: 'Selected answer not found in this question' });
//     }



//     console.log('selectedAnswer', selectedAnswer)

//     const isCorrect = selectedAnswer.isCorrect;

// if (!isCorrect) {
//        return res.status(400).json({  message: 'Invalid answer!\nPlease try again.' });
//     }

//     const track = await TrackAnswer.create({
//       studentId,
//       questionId,
//       courseId: question.courseId,
//       levelId: question.levelId,
//       selectedAnswerId: answerId,
//       isCorrect,
//     });

//     res.status(200).json({
//       message: 'Answer submitted successfully',
//       track,
//       isCorrect
//     });
//   } catch (error) {
//     console.error('Error submitting answer:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




const submitAnswer = async (req, res) => {
  try {
    const {
      studentId,
      questionId,
      answerId,
      answerText 
    } = req.body;

    console.log(req.body);

    // Check duplicate submission
    const existing = await TrackAnswer.findOne({ studentId, questionId });
    if (existing) {
      return res.status(409).json({
        message: 'You have already submitted an answer for this question.',
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let isAnswerCorrect = false;
    let selectedAnswerId;

    if (answerText !== undefined) {
      // 🎤 AUDIO question
      if (!question.audioAnswer || !question.audioAnswer.transcript) {
        return res.status(400).json({ message: 'Transcript not found for audio question' });
      }

      isAnswerCorrect =
        answerText.trim().toLowerCase() === question.audioAnswer.transcript.trim().toLowerCase();

      if (!isAnswerCorrect) {
        return res.status(400).json({ message: 'Incorrect answer.\nPlease try again.' });
      }

      // Use dummy ID (required by schema)
      selectedAnswerId = question._id;

    } else if (answerId !== undefined) {
      // ✅ MCQ question
      const selectedAnswer = question.mcqAnswers.find(ans => ans._id.toString() === answerId);

      if (!selectedAnswer) {
        return res.status(400).json({ message: 'Selected answer not found in this question' });
      }

      isAnswerCorrect = selectedAnswer.isCorrect;
      selectedAnswerId = selectedAnswer._id;

      if (!isAnswerCorrect) {
        return res.status(400).json({ message: 'Invalid answer!\nPlease try again.' });
      }

    } else {
      return res.status(400).json({ message: 'No valid answer provided' });
    }

    // ✅ Only store answer if it's correct
    const track = await TrackAnswer.create({
      studentId,
      questionId,
      courseId: question.courseId,
      levelId: question.levelId,
      selectedAnswerId,
      isCorrect: isAnswerCorrect,
    });

    res.status(200).json({
      message: 'Answer submitted successfully',
      isCorrect: isAnswerCorrect,
      track,
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};








const getAnswersByStudentAndCourse = async (req, res) => {
  const { studentId, courseId, levelId } = req.params;

  try {
    // const answers = await TrackAnswer.find({ studentId, courseId, levelId });
    // res.status(200).json({ data: answers });

 const answers = await TrackAnswer.find({ studentId, courseId, levelId })
      .populate({
        path: 'questionId',
        select: 'questionType audioAnswer', // include audioAnswer too
      })
      .lean();

 console.log('answers', answers);



    const enrichedAnswers = answers.map((answer) => ({
      ...answer,
      questionType: answer.questionId?.questionType || null,
      transcript: answer.questionId?.audioAnswer?.transcript || null,
    }));

    console.log('enrichedAnswers', enrichedAnswers);


    res.status(200).json({ data: enrichedAnswers });


  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = { submitAnswer, getAnswersByStudentAndCourse };
