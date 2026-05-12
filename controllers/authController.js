const registerValidation = require("./validation/authValidation");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const registerController = async (req, res) => {
  try {
    const { error, value } = registerValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { name, email, password, phone, NID, location, role, doctorInfo } =
      value;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin cannot be created from registration",
      });
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      NID,
      location,
      role,
    });

    if (role === "doctor" && doctorInfo) {
      newUser.doctorInfo = {
        syndicateCardImage: doctorInfo.syndicateCardImage,
        universityCertificateImage: doctorInfo.universityCertificateImage,
        nationalIdImage: doctorInfo.nationalIdImage,
        isApproved: false,
      };
    }

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      data:User
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerController,
};
