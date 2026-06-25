const mongoose = require("mongoose");

const idSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
        unique: true,

    },

    emergencyNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^01[0125]\d{8}$/, "Invalid Egyptian phone number"],
    },
bloodType: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
    },
    address: {
      type: String,
      trim: true,
    },

    note: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "default.jpg",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("IDSearch", idSearchSchema);