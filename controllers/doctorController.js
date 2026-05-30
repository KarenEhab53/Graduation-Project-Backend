const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Slot = require("../models/Slots");
const sendEmail = require("../services/emailService");
const { doctorProfileValidation,updateProfileValidation } = require("./validation/doctorValidation");
const { slotsValidation } = require("./validation/slotsValidation");
// ================= GET DOCTORS =================
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" });
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No doctors found",
      });
    }
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
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
// ================= Doctor Profile =================
const addDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error, value } = doctorProfileValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors allowed" });
    }

    const existing = await Doctor.findOne({ userId });

    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const doctor = await Doctor.create({
      userId,
      ...value,
    });

    res.status(201).json({
      message: "Doctor profile created successfully",
      doctorInfo: doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= UPDATE Doctor Profile =================
const updateDoctorProfile =async (req,res) => {
  try {
    const userId=req.user.id;
    const {error,value}=updateProfileValidation.validate(req.body,{
      abortEarly:false,
      stripUnknown:true
    })
    if(error){
      return res.status(400).json({
        message:error.details[0].message
      })
    }
    const user = await User.findById(userId);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors allowed" });
    }
     const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Only doctors can update profile",
      });
    }

    Object.keys(value).forEach((key) => {
      doctor[key] = value[key];
    });

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
     return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// ================= GET Doctor Profile =================
const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const doctor = await Doctor.findOne({ userId })
      .populate("userId", "name email phone profileImage location");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        msg: "Doctor Profile not found",
      });
    }

    const slots = await Slot.find({
      doctorId: doctor.id,
      isBooked: false,
    });

    res.status(200).json({
      success: true,
      data: {
        ...doctor.toObject(),
        slots,
      },
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};
// ================= ADD Doctor SLOTS =================
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const addSlots = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { date, from, to } = req.body;

    const start = toMinutes(from);
    const end = toMinutes(to);

    if (start >= end) {
      return res.status(400).json({
        message: "From must be before To",
      });
    }

    const slots = [];

    for (let t = start; t < end; t += 30) {
      slots.push({
        doctorId: doctor._id,
        date: new Date(date),
        from: toTime(t),
        to: toTime(t + 30),
      });
    }

    await Slot.insertMany(slots);

    return res.status(201).json({
      success: true,
      message: "Slots created successfully",
      slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  ApproveDoctor,
  revokeDoctor,
  getAllDoctors,
  addDoctorProfile,
  updateDoctorProfile,
  getDoctorProfile,
  addSlots,
};
