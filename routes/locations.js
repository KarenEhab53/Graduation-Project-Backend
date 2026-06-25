// routes/locations.js
const router = require("express").Router();

const EGYPT_GOVERNORATES = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Dakahlia",
  "Sharqia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Ismailia",
  "Damietta",
  "Kafr El Sheikh",
  "Faiyum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
];

router.get("/locations", (req, res) => {
  res.json({ locations: EGYPT_GOVERNORATES });
});

module.exports = router;
