const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, trim: true, unique: true },

    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      select: false
    },
    location: {
      type: String,
      enum: [
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
      ],
      default: "Cairo",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^01[0-2,5]{1}[0-9]{8}$/,
    },

    NID: { type: String, required: true, trim: true, match: /^[0-9]{14}$/ },

    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "doctor"],
      default: "user",
    },

    profileImage: {
      type: String,
      default: "default.jpg",
    },

    doctorInfo: {
      syndicateCardImage: String,
      universityCertificateImage: String,
      nationalIdImage: String,

      isApproved: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
