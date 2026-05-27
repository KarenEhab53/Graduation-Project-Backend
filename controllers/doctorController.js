const User = require("../models/User");
const sendEmail = require("../services/emailService");

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
    res.status(500).json({msg:error.message})
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
// =================  =================

module.exports = {
  ApproveDoctor,
  revokeDoctor,
  getAllDoctors
};
