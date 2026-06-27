const IDSearch = require("../models/idSearch.js");
const User = require("../models/User.js");
const {
  idSearchValidation,
} = require("../controllers/validation/idSearchValidation");

const addIDSearch = async (req, res) => {
  try {
    const { error, value } = idSearchValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details.map((err) => err.message),
      });
    }

    // Check if already exists
    const existingIDSearch = await IDSearch.findOne({
      userId: req.user.id,
    });

    if (existingIDSearch) {
      return res.status(409).json({
        message: "User already has an ID Search record",
      });
    }

    const { emergencyNumber, bloodType, address, note } = value;

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const profileImage = req.files?.profileImage?.[0]
      ? `${baseUrl}/uploads/${req.files.profileImage[0].filename}`
      : `${baseUrl}/uploads/default.jpg`;

    const idSearch = await IDSearch.create({
      userId: req.user.id,
      emergencyNumber,
      bloodType,
      address,
      note,
      profileImage,
    });

    res.status(201).json({
      message: "ID Search record created successfully",
      data: idSearch,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateIDSearch = async (req, res) => {
  try {
    const { error, value } = idSearchValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details.map((err) => err.message),
      });
    }

    const idSearch = await IDSearch.findOne({
      userId: req.user.id,
    });

    if (!idSearch) {
      return res.status(404).json({
        message: "ID Search record not found",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (req.files?.profileImage?.[0]) {
      value.profileImage = `${baseUrl}/uploads/${req.files.profileImage[0].filename}`;
    }

    const updatedIDSearch = await IDSearch.findByIdAndUpdate(
      idSearch._id,
      value,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      message: "ID Search updated successfully",
      data: updatedIDSearch,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteIDSearch = async (req, res) => {
  try {
    const idSearch = await IDSearch.findOneAndDelete({
      userId: req.user.id,
    });

    if (!idSearch) {
      return res.status(404).json({
        message: "ID Search record not found",
      });
    }

    res.status(200).json({
      message: "ID Search deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getIDSearchByNid = async (req, res) => {
  try {
    const { NID } = req.params;

    const user = await User.findOne({ NID });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const idSearch = await IDSearch.findOne({
      userId: user._id,
    }).populate("userId", "username email nid");

    if (!idSearch) {
      return res.status(404).json({
        message: "ID Search record not found",
      });
    }

    res.status(200).json({
      data: idSearch,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getMyNID = async (req, res) => {
  try {
    const userId = req.user.id;

    const idSearch = await IDSearch.findOne({
      userId,
    }).populate("userId", "username email nid");

    if (!idSearch) {
      return res.status(404).json({
        message: "ID Search record not found",
      });
    }

    res.status(200).json({
      data: idSearch,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  addIDSearch,
  updateIDSearch,
  deleteIDSearch,
  getIDSearchByNid,
  getMyNID
};
