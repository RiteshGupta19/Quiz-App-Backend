// const Joi = require('joi');

// const questionValidation = Joi.object({
//   courseId: Joi.string()
//     .required()
//     .messages({ 'any.required': 'Course ID is required' }),

//   levelId: Joi.string()
//     .required()
//     .messages({ 'any.required': 'Level ID is required' }),

//   userId: Joi.string()
//     .required()
//     .messages({ 'any.required': 'User ID is required' }),

//   questionType: Joi.string()
//     .valid('mcq', 'true_false')
//     .required()
//     .messages({
//       'any.only': 'Question type must be either "mcq" or "true_false"',
//       'any.required': 'Question type is required',
//     }),

//   title: Joi.string()
//     .trim()
//     .min(5)
//     .max(500)
//     .required()
//     .messages({
//       'string.empty': 'Question title is required',
//       'string.min': 'Title should have at least 5 characters',
//       'string.max': 'Title should not exceed 500 characters',
//     }),

//   mcqAnswers: Joi.alternatives().conditional('questionType', {
//     is: 'mcq',
//     then: Joi.array()
//       .min(2)
//       .items(
//         Joi.object({
//           text: Joi.string().required().messages({ 'any.required': 'Answer text is required' }),
//           isCorrect: Joi.boolean().required().messages({ 'any.required': 'isCorrect must be true or false' }),
//         })
//       )
//       .required()
//       .messages({
//         'array.min': 'MCQ must have at least two answers',
//         'any.required': 'MCQ answers are required',
//       }),
//     otherwise: Joi.forbidden(),
//   }),

//   trueFalseAnswer: Joi.alternatives().conditional('questionType', {
//     is: 'true_false',
//     then: Joi.string()
//       .valid('true', 'false')
//       .required()
//       .messages({
//         'any.only': 'True/False answer must be "true" or "false"',
//         'any.required': 'True/False answer is required',
//       }),
//     otherwise: Joi.forbidden(),
//   }),
// });

// module.exports = { questionValidation };















const Joi = require('joi');

const questionValidation = Joi.object({
  courseId: Joi.string().required().messages({
    'any.required': 'Course ID is required',
  }),

  levelId: Joi.string().required().messages({
    'any.required': 'Level ID is required',
  }),

  userId: Joi.string().required().messages({
    'any.required': 'User ID is required',
  }),

  questionType: Joi.string()
    .valid('mcq', 'true_false', 'audio')
    .required()
    .messages({
      'any.only': 'Question type must be either "mcq", "true_false", or "audio"',
      'any.required': 'Question type is required',
    }),

    title: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Question title is required',
      'string.min': 'Title should have at least 5 characters',
      'string.max': 'Title should not exceed 500 characters',
    }),


  transcript: Joi.alternatives().conditional('questionType', {
    is: 'audio',
    then: Joi.string()
      .trim()
      .min(3)
      .required()
      .messages({
        'string.empty': 'Transcript is required for audio questions',
        'any.required': 'Transcript is required for audio questions',
      }),
    otherwise: Joi.forbidden(),
  }),

  mcqAnswers: Joi.alternatives().conditional('questionType', {
    is: 'mcq',
    then: Joi.array()
      .min(2)
      .items(
        Joi.object({
          text: Joi.string().required().messages({
            'any.required': 'Answer text is required',
          }),
          isCorrect: Joi.boolean().required().messages({
            'any.required': 'isCorrect must be true or false',
          }),
        })
      )
      .required()
      .messages({
        'array.min': 'MCQ must have at least two answers',
        'any.required': 'MCQ answers are required',
      }),
    otherwise: Joi.forbidden(),
  }),

  trueFalseAnswer: Joi.alternatives().conditional('questionType', {
    is: 'true_false',
    then: Joi.string()
      .valid('true', 'false')
      .required()
      .messages({
        'any.only': 'True/False answer must be "true" or "false"',
        'any.required': 'True/False answer is required',
      }),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = { questionValidation };
