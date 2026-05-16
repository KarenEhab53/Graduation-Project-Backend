const {registerValidation, loginValidation} = require("./validation/authValidation");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

    const { name, email, password, phone, NID, location, role } = value;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin cannot be created from registration",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      NID,
      location,
      role,
    });
   const baseUrl = `${req.protocol}://${req.get("host")}`;

   if (role === "doctor") {
     newUser.doctorInfo = {
       syndicateCardImage: req.files?.syndicateCardImage?.[0]
         ? `${baseUrl}/uploads/${req.files.syndicateCardImage[0].filename}`
         : "",

       universityCertificateImage: req.files?.universityCertificateImage?.[0]
         ? `${baseUrl}/uploads/${req.files.universityCertificateImage[0].filename}`
         : "",

       nationalIdImage: req.files?.nationalIdImage?.[0]
         ? `${baseUrl}/uploads/${req.files.nationalIdImage[0].filename}`
         : "",

       isApproved: false,
     };
   }

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


const loginController = async (req, res) => {
  try {
    const { error, value } = loginValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.role === "doctor" && user.doctorInfo?.isApproved === false) {
      return res.status(403).json({
        message: "Your account is pending admin approval",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerController,
  loginController,
};
