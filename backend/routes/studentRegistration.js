// studentRegistration.js
const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const jwt = require('jsonwebtoken');

/**
 * GET /api/students/verify/:studentId
 * Verify if a student ID exists
 */
router.get('/verify/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Find student by ID
    const student = await Student.findOne({ 
      studentId: studentId.toUpperCase().trim()
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student ID not found. Please contact administrator.'
      });
    }

    // Check account status
    if (student.accountStatus === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Account already exists. Please login instead.',
        student: {
          studentId: student.studentId,
          fullName: student.fullName,
          department: student.department,
          year: student.year,
          accountStatus: student.accountStatus
        }
      });
    }

    if (student.accountStatus === 'PendingVerification') {
      return res.status(400).json({
        success: false,
        message: 'Account creation in progress. Please try again later.',
        student: {
          studentId: student.studentId,
          fullName: student.fullName,
          department: student.department,
          year: student.year,
          accountStatus: student.accountStatus
        }
      });
    }

    // Student found and can register
    return res.json({
      success: true,
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        department: student.department,
        year: student.year,
        accountStatus: student.accountStatus
      }
    });

  } catch (error) {
    console.error('Student verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

/**
 * POST /api/students/simple-register
 * Simple registration - just Student ID and Password
 */
router.post('/simple-register', async (req, res) => {
  try {
    const { studentId, email, password } = req.body;

    // Validate input
    if (!studentId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(email).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find student by ID
    const student = await Student.findOne({ 
      studentId: studentId.toUpperCase().trim()
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student ID not found. Please contact administrator.'
      });
    }

    // Check if account already exists
    if (student.accountStatus === 'Active') {
      return res.status(409).json({
        success: false,
        message: 'Account already exists. Please login instead.'
      });
    }

    // Check if email is already used by another active account
    const existingEmail = await Student.findOne({
      email: email.toLowerCase().trim(),
      accountStatus: 'Active',
      _id: { $ne: student._id } // Exclude current student
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered. Please use a different email.'
      });
    }

    // Update student with email and password
    student.email = email.toLowerCase().trim();
    student.password = password;
    student.accountStatus = 'Active';
    student.emailVerified = true;
    student.claimedAt = new Date();
    
    await student.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: student._id,
        studentId: student.studentId,
        email: student.email,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Account created successfully!',
      token,
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        year: student.year
      }
    });

  } catch (error) {
    console.error('Simple register error:', error);
    
    // Handle duplicate key error (email)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered. Please use a different email.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;