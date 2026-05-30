const { string } = require("joi");
const mongoose = require("mongoose");
const User =require("./User")
const doctorSchema = new mongoose.Schema({
 userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
},
  specialty: String,
  subSpecialty: [String],
  bio: String,

  experienceYears: Number,

  clinicLocation: [String],

  consultationFee: Number,
  conditionsTreated: [String],

  education: [
    {
      degree: String,
      university: String,
      year: Number,
    },
  ],

  certifications: [
    {
      name: String,
      issuer: String,
      year: Number,
    },
  ],

  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },

  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      comment: String,
      rating: Number,
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Doctor", doctorSchema);
