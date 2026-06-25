const Joi = require("joi");

const idSearchValidation = Joi.object({
  emergencyNumber: Joi.string()
    .pattern(/^01[0125]\d{8}$/)
    .required()
    .messages({
      "string.empty": "Emergency number is required",
      "string.pattern.base": "Invalid Egyptian phone number",
      "any.required": "Emergency number is required",
    }),
  bloodType: Joi.string()
    .valid(
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-"
    )
    .messages({
      "any.only":
        "Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, O-",
    }),

  address: Joi.string()
    .trim()
    .max(255)
    .optional(),

  note: Joi.string()
    .trim()
    .max(1000)
    .optional(),

  profileImage: Joi.string()
    .optional(),
});

module.exports = {idSearchValidation};