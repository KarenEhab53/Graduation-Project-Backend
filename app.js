const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


async function dbConnection() {
  try {
    await mongoose.connect(
      process.env.DB_URL || "mongodb://127.0.0.1:27017/swift_savers",
    );
    console.log("DB Connected successfully");
  } catch (error) {
    console.error("DB Connection Error:", error.message);
  }
}

const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

const doctorRoutes = require("./routes/doctorRoutes");
app.use("/api", doctorRoutes);

const locationsRoutes = require("./routes/locations");
app.use("/api", locationsRoutes);

const port = process.env.PORT || 3000;

dbConnection();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
