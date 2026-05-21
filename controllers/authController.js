const {
  registerValidation,
  loginValidation,
} = require("./validation/authValidation");

const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/emailService");

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
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // DOCTOR STATUS CHECK
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

    const safeUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= APPROVE DOCTOR =================
const ApproveDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.doctorInfo.status = "approved";
    await doctor.save();

    await sendEmail(
      doctor.email,
      "Account Approved",
      "Your doctor account has been approved. You can now login.",
    );

    res.status(200).json({
      message: "Doctor approved successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REVOKE (REJECT) DOCTOR =================
const revokeDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.doctorInfo.status = "rejected";
    await doctor.save();

    await sendEmail(
      doctor.email,
      "Account Rejected",
      "Your doctor account has been rejected. Please contact support.",
    );

    res.status(200).json({
      message: "Doctor rejected successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerController,
  loginController,
  ApproveDoctor,
  revokeDoctor,
};
