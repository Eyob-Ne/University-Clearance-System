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
    const { studentId, password } = req.body;

    // Validate input
    if (!studentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and password are required'
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

    // Update student with password
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
        department: student.department,
        year: student.year
      }
    });

  } catch (error) {
    console.error('Simple register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;