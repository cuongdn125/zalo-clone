const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  userName: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(30).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(30).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
