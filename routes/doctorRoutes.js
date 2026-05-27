const express = require("express");
const router = express.Router();
const {
  ApproveDoctor,
  revokeDoctor,getAllDoctors
} = require("../controllers/doctorController");
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
router.get("/all-doctors",getAllDoctors)
router.patch("/approve-doctor/:id", auth, isAdmin, ApproveDoctor);
router.patch("/revoke-doctor/:id", auth, isAdmin, revokeDoctor);
module.exports=router