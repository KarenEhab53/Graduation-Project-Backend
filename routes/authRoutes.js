const express = require("express");
const router = express.Router();

const {
  registerController,
  loginController,
  getProfile,
  ApproveDoctor,
  revokeDoctor,updateController,forgetPassword,verifyOtp,resetPassword,deleteUser
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
router.get("/profile", auth, getProfile);
router.put("/update-profile", auth, upload.fields([{ name: "profileImage", maxCount: 1 },]),updateController,);
router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.delete("/delete-user/:id", auth, isAdmin, deleteUser);
module.exports = router;
