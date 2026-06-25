const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  verifyOtpValidation,
  resetPasswordValidation,
} = require("./validation/authValidation");

const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../services/emailService");
const Slots = require("../models/Slots");
const Doctor = require("../models/Doctor");

// ================= REGISTER =================
const registerController = async (req, res) => {
  try {
    const { error, value } = registerValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, phone, NID, location, role } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin cannot be created from registration",
      });
    }
    const existingNID = await User.findOne({ NID });

    if (existingNID) {
      return res.status(400).json({
        success: false,
        message: "National ID already exists",
      });
    }
    if (role === "doctor") {
      const files = req.files || {};

      if (
        !files.syndicateCardImage ||
        !files.universityCertificateImage ||
        !files.nationalIdImage
      ) {
        return res.status(400).json({
          message: "All doctor documents are required",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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
        syndicateCardImage: `${baseUrl}/uploads/${req.files.syndicateCardImage[0].filename}`,
        universityCertificateImage: `${baseUrl}/uploads/${req.files.universityCertificateImage[0].filename}`,
        nationalIdImage: `${baseUrl}/uploads/${req.files.nationalIdImage[0].filename}`,
        status: "pending",
      };
    }

    newUser.profileImage = req.files?.profileImage?.[0]
      ? `${baseUrl}/uploads/${req.files.profileImage[0].filename}`
      : `${baseUrl}/uploads/default.jpg`;

    await newUser.save();

    const safeUser = await User.findById(newUser._id).select("-password");

    res.status(201).json({
      message: "User registered successfully",
      data: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
// ================= LOGIN =================
const loginController = async (req, res) => {
  try {
    const { error, value } = loginValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.role === "doctor") {
      const status = user.doctorInfo?.status;

      if (status === "pending") {
        return res.status(403).json({
          message: "Your account is pending admin approval",
        });
      }

      if (status === "rejected") {
        return res.status(403).json({
          message: "Your account has been rejected by admin",
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const safeUser = await User.findById(user.id).select("-password");

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= DELETE USER (DOCTOR/PATIENT) =================
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }
    const doctor = await Doctor.findOneAndDelete({ userId });

    if (doctor) {
      await Slots.deleteMany({ doctorId: doctor._id });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      msg: "User and related data deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
// ================= UPDATE PROFILE =================
const updateController = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { error, value } = updateProfileValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { name, phone, location } = value || {};

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const profileImage = req.files?.profileImage?.[0]
      ? `${baseUrl}/uploads/${req.files.profileImage[0].filename}`
      : undefined;

    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (profileImage) updateData.profileImage = profileImage;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// ================= GET PROFILE =================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
// ================= FORGET PASSWORD =================
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "user not found" });
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    // console.log(user.email);

    await sendEmail(
      user.email,
      "reset password",
      `Your OTP is: ${otp}. It expires in 10 minutes.`,
    );
    res.status(200).json({ msg: "Otp sent to email" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
// ================= VERIFY OTP =================
const verifyOtp = async (req, res) => {
  try {
    const { error, value } = verifyOtpValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, otp } = value;

    const user = await User.findOne({
      email,
      resetOtp: otp.toString(),
      resetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    res.json({
      message: "OTP verified",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};
// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }
    const token = authHeader.split(" ")[1];
    const { error, value } = resetPasswordValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { password, confirmPassword } = value;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  registerController,
  loginController,
  updateController,
  forgetPassword,
  verifyOtp,
  resetPassword,
  deleteUser,
  getProfile,
};
