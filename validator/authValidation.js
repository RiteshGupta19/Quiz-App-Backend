const Joi = require('joi');

const signUpValidation = Joi.object({
  name: Joi.string()
    .trim()
    .replace(/\s+/g, ' ') 
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name should have at least 2 characters',
    }),

  email: Joi.string()
    .trim()
    .replace(/\s+/g, '') 
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter a valid email',
    }),

  password: Joi.string()
    .trim()
    .replace(/\s+/g, '') 
    .min(6)
    .pattern(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password should be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one special character',
    }),

  tandc: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must agree to the Terms & Conditions',
    }),
});


const signInValidation = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter a valid email',
    }),
  password: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
});

module.exports = {
  signUpValidation,
  signInValidation
};


