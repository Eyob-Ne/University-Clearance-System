const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { protectStudent } = require("../middleware/auth");
const crypto = require("crypto");

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

// Forgot Password Route - SIMPLIFIED VERSION
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      // Don't reveal that email doesn't exist for security
      return res.json({ 
        message: "If an account with that email exists, reset instructions have been sent." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token to student document
    student.resetPasswordToken = resetToken;
    student.resetPasswordExpires = resetTokenExpiry;
    await student.save();

    // In development, return the token for testing
    // In production, you would send an email here
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    res.json({ 
      message: "Password reset instructions have been generated.",
      resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
      resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl,
      note: process.env.NODE_ENV === 'production' 
        ? "Reset instructions sent to email" 
        : "For development: Use the reset URL above"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Verify Reset Token
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const student = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!student) {
      return res.status(400).json({ 
        valid: false, 
        error: "Invalid or expired reset token" 
      });
    }

    res.json({ 
      valid: true,
      email: student.email,
      studentName: student.fullName
    });

  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ valid: false, error: "Server error" });
  }
});

// Reset Password Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      // Return 404 to indicate email not found
      return res.status(404).json({ error: "No student account found with this email address." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token to student document
    student.resetPasswordToken = resetToken;
    student.resetPasswordExpires = resetTokenExpiry;
    await student.save();

    // In development, return the token for testing
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    res.json({ 
      message: "Password reset instructions have been generated.",
      resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
      resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;