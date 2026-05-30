const Joi = require("joi");

const doctorProfileValidation = Joi.object({
  specialty: Joi.string().trim().required(),

  subSpecialty: Joi.array().items(
    Joi.string().trim()
  ),

  bio: Joi.string().trim(),

  experienceYears: Joi.number().min(1).max(50),

  clinicLocation: Joi.array().items(
    Joi.string().trim()
  ),

  consultationFee: Joi.number().min(1),

  conditionsTreated: Joi.array().items(
    Joi.string().trim()
  ),

  education: Joi.array().items(
    Joi.object({
      degree: Joi.string(),
      university: Joi.string(),
      year: Joi.number()
    })
  ),

  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      issuer: Joi.string(),
      year: Joi.number()
    })
  )
});
const updateProfileValidation=Joi.object({
  specialty: Joi.string().trim(),

  subSpecialty: Joi.array().items(
    Joi.string().trim()
  ),

  bio: Joi.string().trim(),

  experienceYears: Joi.number().min(1).max(50),

  clinicLocation: Joi.array().items(
    Joi.string().trim()
  ),

  consultationFee: Joi.number().min(1),

  conditionsTreated: Joi.array().items(
    Joi.string().trim()
  ),

  education: Joi.array().items(
    Joi.object({
      degree: Joi.string(),
      university: Joi.string(),
      year: Joi.number()
    })
  ),

  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      issuer: Joi.string(),
      year: Joi.number()
    })
  )
})
module.exports = {doctorProfileValidation,updateProfileValidation};