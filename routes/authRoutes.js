const express = require("express");
const router = express.Router();

const { registerController,loginController } = require("../controllers/authController");

const upload = require("../middleware/upload");

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
router.post("/login",loginController)
module.exports = router;
