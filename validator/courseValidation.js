const Joi = require('joi');

const courseValidation = Joi.object({
  courseName: Joi.string()
    .trim()
    .replace(/\s+/g, ' ') 
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Course name is required',
      'string.min': 'Course name should have at least 2 characters',
      'string.max': 'Course name should not exceed 100 characters'
    }),

  userId: Joi.string()
    .required()
    .messages({
      'string.empty': 'User ID is required'
    }),

  levelIds: Joi.array()
    .items(Joi.string())
    .required()
    .messages({
      'any.required': 'Level IDs are required',
      'array.base': 'Level IDs must be an array of IDs'
    }),
});

module.exports = { courseValidation };
