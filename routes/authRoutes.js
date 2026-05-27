const express = require("express");
const router = express.Router();

const {
  registerController,
  loginController,
  ApproveDoctor,
  revokeDoctor,updateController,forgetPassword,verifyOtp,resetPassword
} = require("../controllers/authController");

const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
router.post(
  "/register",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    {
      name: "syndicateCardImage",
      maxCount: 1,
    },
    {
      name: "universityCertificateImage",
      maxCount: 1,
    },
    {
      name: "nationalIdImage",
      maxCount: 1,
    },
  ]),
  registerController,
);
router.post("/login", loginController);
router.put("/update-profile",auth,updateController)
router.post("/forget-password",forgetPassword)
router.post("/verfiy-otp",verifyOtp)
router.post("/reset-password",resetPassword)
module.exports = router;
