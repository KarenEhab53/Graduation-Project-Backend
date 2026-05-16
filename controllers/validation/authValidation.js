const Joi = require('joi');
const registerValidation = Joi.object({
  name: Joi.string().required().trim().min(3).max(30),

  email: Joi.string().email().required().trim(),

  password: Joi.string()
    .required()
    .trim()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .messages({
      "string.pattern.base": "Password must contain letters and numbers",
    }),

  phone: Joi.string()
    .required()
    .trim()
    .pattern(/^01[0-2,5]{1}[0-9]{8}$/)
    .messages({
      "string.pattern.base": "Phone number must be a valid Egyptian number",
    }),

  NID: Joi.string()
    .required()
    .trim()
    .pattern(/^[0-9]{14}$/)
    .messages({
      "string.pattern.base": "NID must be a 14-digit number",
    }),

  location: Joi.string()
    .valid(
      "Cairo",
      "Giza",
      "Alexandria",
      "Dakahlia",
      "Sharqia",
      "Qalyubia",
      "Gharbia",
      "Monufia",
      "Fayoum",
      "Beni Suef",
      "Minya",
      "Assiut",
      "Sohag",
      "Qena",
      "Luxor",
      "Aswan",
      "Suez",
      "Ismailia",
      "Port Said",
      "Red Sea",
      "North Sinai",
      "South Sinai",
    )
    .default("Cairo"),
  role: Joi.string().valid("user", "doctor").default("user"),
});
const loginValidation = Joi.object({
  email: Joi.string().email().required().trim(),

  password: Joi.string()
    .required()
    .trim()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .messages({
      "string.pattern.base": "Password must contain letters and numbers",
    }),
});
module.exports={registerValidation,loginValidation}