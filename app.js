const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

app.use(express.json());

async function dbConnection() {
  try {
    await mongoose.connect(
      process.env.DB_URL || "mongodb://127.0.0.1:27017/swift_savers",
    );
    console.log("DB Connected successfully");
  } catch (error) {
    console.error(" DB Connection Error:", error.message);
  }
}
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

const port = process.env.PORT || 3000;

dbConnection();
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});
