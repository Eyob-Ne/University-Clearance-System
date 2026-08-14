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
const studentRegistrationRoutes = require('./routes/studentRegistration');
const systemRoutes = require("./routes/systemRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const departmentRoutes = require('./routes/departmentRoutes');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://eyoba8315_db_user:eyob123@cluster1.rzggffr.mongodb.net/clearance"; 
mongoose.connect(uri, { dbName: "clearance" })
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
app.use("/api/students", studentRegistrationRoutes);
app.use("/api/system", systemRoutes);
app.use('/api/admin', collegeRoutes);
app.use('/api/admin', departmentRoutes);
// Get port from Render environment or use default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});