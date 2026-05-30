const Joi = require("joi");

const slotsValidation = Joi.object({
  date: Joi.date().iso().required().messages({
    "date.base": "Invalid date",
    "any.required": "Date is required",
  }),

  from: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "From must be HH:MM (24h format)",
      "any.required": "From is required",
    }),

  to: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "To must be HH:MM (24h format)",
      "any.required": "To is required",
    }),
}).custom((value, helpers) => {
  const [fh, fm] = value.from.split(":").map(Number);
  const [th, tm] = value.to.split(":").map(Number);

  if (fh * 60 + fm >= th * 60 + tm) {
    return helpers.message("From time must be before To time");
  }

  return value;
});
module.exports={slotsValidation}