const Joi = require('joi');

const courseValidation = Joi.object({
  courseName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Course name is required',
      'string.min': 'Course name should have at least 2 characters',
      'string.max': 'Course name should not exceed 100 characters',
      'any.required': 'Course name is required'
    }),

  userId: Joi.string()
    .required()
    .messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    }),

  levelIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.base': 'Level IDs must be an array of strings',
      'array.min': 'Select at least one level',
      'any.required': 'Level IDs are required'
    }),
});

const updateCourseValidation = Joi.object({
  courseName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Course name is required',
      'string.min': 'Course name should have at least 2 characters',
      'string.max': 'Course name should not exceed 100 characters',
      'any.required': 'Course name is required'
    }),

  levelIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.base': 'Level IDs must be an array of strings',
      'array.min': 'Select at least one level',
      'any.required': 'Level IDs are required'
    }),
});

module.exports = { courseValidation, updateCourseValidation };
