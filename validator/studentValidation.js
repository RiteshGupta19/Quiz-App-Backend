const Joi = require('joi');

const studentValidation = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'string.empty': 'User ID is required',
    }),

  name: Joi.string()
    .trim()
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Student name is required',
      'string.min': 'Student name must be at least 2 characters',
      'string.max': 'Student name must be under 50 characters',
    }),

  mobileNo: Joi.string()
  .pattern(/^\d+$/)
  .required()
  .messages({
    'string.empty': 'Mobile number is required',
    'string.pattern.base': 'Mobile number must contain only digits',
  }),
  
  courseIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.base': 'Course IDs must be an array',
      'array.min': 'At least one course ID is required',
    }),

  isEnrolled: Joi.boolean()
    .optional(), // Or `.default(true)` if you want to always set it
});


module.exports = { studentValidation };