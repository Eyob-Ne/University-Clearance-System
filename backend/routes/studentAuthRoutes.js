const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { protectStudent } = require("../middleware/auth");
const crypto = require("crypto");
const sendResetEmail = require("../utils/sendResetEmail");


// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: "7d",
  });
};

// 📌 Student Registration
router.post("/register", async (req, res) => {
  try {
    const { studentId, fullName, email, password, department, year } = req.body;

    // Check if ID already exists
    const existingStudentId = await Student.findOne({ studentId });
    if (existingStudentId)
      return res.status(400).json({ error: "Student ID already registered" });

    // Check if email already exists
    const existingEmail = await Student.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ error: "Email already registered" });

    // Create new student
    const student = new Student({
      studentId,
      fullName,
      email,
      password,
      department,
      year,
    });

    await student.save();

    // Response with token
    res.status(201).json({
      message: "Student registered successfully",
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        year: student.year,
      },
      token: generateToken(student._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Student Login
router.post("/login", async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Validate fields
    if (!studentId || !password) {
      return res.status(400).json({ error: "Please enter student ID and password" });
    }

    // Check student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Compare passwords
    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Successful login
    res.status(200).json({
      message: "Login successful",
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        department: student.department,
        email: student.email,
        year: student.year,
      },
      token: generateToken(student._id),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/auth/me", protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      id: student._id,
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      year: student.year,
      clearance: student.departmentStatuses || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get Student Profile (FIXED ROUTE)
router.get("/me", protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      id: student._id,
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      year: student.year,
      clearance: student.clearance || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    student.otp = {
      code: otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    await student.save();

    // Send OTP via email
    await sendResetEmail(student.email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});


router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const student = await Student.findOne({ email });
    if (!student || !student.otp) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (student.otp.expires < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (student.otp.code !== otp) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const student = await Student.findOne({ email });
    if (!student || !student.otp) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (student.otp.expires < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (student.otp.code !== otp) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    // Update password
    student.password = newPassword;
    student.otp = undefined; // clear OTP
    await student.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});



module.exports = router;