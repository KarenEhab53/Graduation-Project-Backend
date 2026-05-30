const express = require("express");
const router = express.Router();
const {
  ApproveDoctor,
  revokeDoctor,getAllDoctors,addDoctorProfile,getDoctorProfile,addSlots,updateDoctorProfile
} = require("../controllers/doctorController");
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
router.get("/all-doctors",getAllDoctors)
router.patch("/approve-doctor/:id", auth, isAdmin, ApproveDoctor);
router.patch("/revoke-doctor/:id", auth, isAdmin, revokeDoctor);
router.post("/doctor-profile", auth, addDoctorProfile);
router.put("/update-doctor-profile", auth, updateDoctorProfile);
router.get("/get-doctor-data/:id", getDoctorProfile);
router.post("/create-slots",auth, addSlots);
module.exports=router