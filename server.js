// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const StudentAuthRoutes = require("./routes/studentAuthRoutes");
const clearanceRoutes = require("./routes/clearance");
const adminRoutes = require("./routes/adminRoutes");
const staffAuthRoutes = require("./routes/staffAuth");
const staffRoutes = require("./routes/staffRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// ✅ MongoDB local connection
const uri = "mongodb://127.0.0.1:27017/university_clearance";

mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("🎓 University Clearance System backend is running 🚀");
});

// Routes
app.use("/api/student/auth", StudentAuthRoutes);
app.use("/api/clearance", clearanceRoutes); 
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffAuthRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/certificates", certificateRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
