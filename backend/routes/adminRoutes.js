const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const Staff = require("../models/staff"); 
const Student = require("../models/student");
const { adminProtect } = require("../middleware/auth");
const bcrypt = require("bcryptjs");


// ====================
// ADMIN LOGIN
// ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      token: admin.generateToken(),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// ADMIN: CREATE STAFF
// ====================
router.post("/create-staff", adminProtect, async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    let existingStaff;

    if (role === "Department Head") {
      // For department heads, check if same department already has a head
      existingStaff = await Staff.findOne({ 
        role: "Department Head", 
        department: department 
      });
      
      if (existingStaff) {
        return res.status(400).json({ 
          message: `Department '${department}' already has a department head.` 
        });
      }
    } else {
      // For other roles, check if role already exists (only one staff per role type)
      existingStaff = await Staff.findOne({ role });
      
      if (existingStaff) {
        return res.status(400).json({ 
          message: `A staff member with role '${role}' already exists. Each role can only have one staff member.` 
        });
      }
    }

    // Also check if email already exists (to prevent duplicate emails)
    const emailExists = await Staff.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ 
        message: "Staff with this email already exists" 
      });
    }

    const staff = new Staff({
      name,
      email,
      password,
      role,
      department: role === "Department Head" ? department : null,
    });

    await staff.save();

    res.json({ 
      message: "Staff account created successfully", 
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        department: staff.department
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================
// ADMIN: GET ALL STAFF
// ====================
router.get('/staff', adminProtect, async (req, res) => {
  try {
    const staff = await Staff.find({}, { password: 0 });
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff'
    });
  }
});

// ====================
// ADMIN: DELETE STAFF
// ====================
router.delete("/staff/:id", adminProtect, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/staff/:id/status', adminProtect, async (req, res) => {
  try {
    const { isActive } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Staff status updated successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating staff status'
    });
  }
});

// ====================
// ADMIN: GET ALL STUDENTS
// ====================
router.get('/students', adminProtect, async (req, res) => {
  try {
    const students = await Student.find({}).select('-password');
    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// ====================
// ADMIN: UPDATE STUDENT CLEARANCE STATUS
// ====================
router.put('/students/:id/clearance', adminProtect, async (req, res) => {
  try {
    const { clearanceStatus } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { clearanceStatus },
      { new: true }
    ).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Clearance status updated successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating clearance status'
    });
  }
});

router.get('/departments', adminProtect, async (req, res) => {
  try {
    const students = await Student.find();
    const departments = [...new Set(students.map(s => s.department))].filter(Boolean);
    const deptData = departments.map(name => ({
      name,
      studentCount: students.filter(s => s.department === name).length
    }));
    res.json({ success: true, data: deptData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
});
module.exports = router;
