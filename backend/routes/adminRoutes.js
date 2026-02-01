const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const Staff = require("../models/staff"); 
const Student = require("../models/student");
const { adminProtect } = require("../middleware/auth");
const ClearanceSettings = require("../models/ClearanceSettings");
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');
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

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// ================= UPLOAD STUDENTS =================
router.post(
  '/upload-students',
  adminProtect,
  upload.single('csvFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No CSV file uploaded'
        });
      }

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      const requiredHeaders = ['studentid', 'fullname', 'department', 'year'];

      let rowCount = 0;
      const students = [];
      const errors = [];

      // ================= CSV PARSER =================
      await new Promise((resolve, reject) => {
        bufferStream
          .pipe(csv({
            mapHeaders: ({ header }) =>
              header
                ?.replace(/^\uFEFF/, '') // BOM FIX
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '')
          }))
          .on('headers', headers => {
            const missing = requiredHeaders.filter(h => !headers.includes(h));
            if (missing.length) {
              bufferStream.destroy();
              reject(
                new Error(`Missing required headers: ${missing.join(', ')}`)
              );
            }
          })
          .on('data', data => {
            rowCount++;

            // Skip empty rows
            if (Object.values(data).every(v => !v)) return;

            const year = Number(data.year);

            if (
              !data.studentid ||
              !data.fullname ||
              !data.department ||
              !Number.isInteger(year)
            ) {
              errors.push({
                row: rowCount,
                error: 'Missing required fields',
                data
              });
              return;
            }

            if (year < 1 || year > 5) {
              errors.push({
                row: rowCount,
                error: 'Year must be between 1 and 5',
                data
              });
              return;
            }

            students.push({
              studentId: data.studentid.trim().toUpperCase(),
              fullName: data.fullname.trim(),
              department: data.department.trim(),
              year,
              isVerified: true,
              verificationStatus: 'Verified',
              isActive: true,
              clearanceStatus: 'Pending',
              verifiedBy: req.admin?.name || 'Admin',
              verifiedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });

      if (!students.length) {
        return res.status(400).json({
          success: false,
          message: 'No valid student records found',
          errors
        });
      }

      // ================= BULK WRITE =================
const operations = students.map(student => ({
  updateOne: {
    filter: { studentId: student.studentId },
    update: {
      $set: {
        ...student,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    upsert: true
  }
}));

let dbResult;
try {
  dbResult = await Student.bulkWrite(operations, { ordered: false });
} catch (dbError) {
  console.error('Database error:', dbError);
  return res.status(500).json({
    success: false,
    message: 'Database error while saving students',
    error: dbError.message   // 👈 ALWAYS show it for now
  });
}

// ================= SUMMARY COUNTS (MATCH UI) =================
const newlyCreated = dbResult.upsertedCount || 0;
const alreadyExists = dbResult.modifiedCount || 0;
const successfullyProcessed = newlyCreated + alreadyExists;

return res.json({
  success: true,
  message: 'CSV processed successfully',
  summary: {
    totalRows: students.length + errors.length, // IMPORTANT
    successfullyProcessed,
    newlyCreated,
    alreadyExists,
    failedRows: errors.length
  },
  preview: students.slice(0, 10),
  errors: errors.length > 0 ? errors : undefined
});

    } catch (error) {
      console.error('CSV Upload Error:', error);

      return res.status(400).json({
        success: false,
        message: error.message || 'CSV processing failed'
      });
    }
  }
);

/**
 * GET /api/admin/students/verify/:studentId
 * Check if student exists in database (for registration page)
 */
router.get('/students/verify/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId.trim().toUpperCase();
    
    const student = await Student.findOne({ studentId })
      .select('studentId fullName department year accountStatus emailVerified');
    
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
        message: 'Account already active. Please login instead.'
      });
    }
    
    if (student.accountStatus === 'PendingVerification') {
      return res.status(400).json({
        success: false,
        message: 'Account pending verification. Check your email for verification code.'
      });
    }
    
    // Account is Unclaimed - can register
    res.json({
      success: true,
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        department: student.department,
        year: student.year,
        accountStatus: student.accountStatus
      }
    });
    
  } catch (err) {
    console.error('Verify student error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error verifying student'
    });
  }
});

// CLEARANCE SYSTEM SETTINGS ENDPOINTS
// ============================================

// GET current clearance settings
router.get("/clearance-settings", adminProtect, async (req, res) => {
  try {
    const settings = await ClearanceSettings.getCurrentSettings();
    const systemStatus = settings.isSystemOpen();
    
    res.json({
      success: true,
      data: {
        startDate: settings.startDate,
        endDate: settings.endDate,
        isActive: settings.isActive,
        manuallyOpened: settings.manuallyOpened,
        emergencyClosed: settings.emergencyClosed,
        lastUpdated: settings.lastUpdated,
        updatedBy: settings.updatedBy,
        currentStatus: systemStatus
      }
    });
  } catch (error) {
    console.error("Get clearance settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clearance settings"
    });
  }
});

// UPDATE clearance settings
router.post("/clearance-settings", adminProtect, async (req, res) => {
  try {
    const { startDate, endDate, isActive } = req.body;
    
    // Validation
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    // Validate dates
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }
    
    if (end < now) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be in the past"
      });
    }
    
    // Get current settings
    let settings = await ClearanceSettings.getCurrentSettings();
    
    // Update settings
    settings.startDate = start;
    settings.endDate = end;
    settings.isActive = isActive !== undefined ? isActive : settings.isActive;
    settings.updatedBy = req.admin._id;
    settings.lastUpdated = new Date();
    
    // Reset manual overrides when schedule changes
    if (settings.manuallyOpened || settings.emergencyClosed) {
      settings.manuallyOpened = false;
      settings.emergencyClosed = false;
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: "Clearance settings updated successfully",
      data: settings
    });
  } catch (error) {
    console.error("Update clearance settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update clearance settings"
    });
  }
});

// EMERGENCY TOGGLE (open/close system)
router.post("/emergency-toggle", adminProtect, async (req, res) => {
  try {
    const { action } = req.body;
    
    if (!['open', 'close'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'open' or 'close'"
      });
    }
    
    const settings = await ClearanceSettings.getCurrentSettings();
    
    if (action === 'open') {
      settings.manuallyOpened = true;
      settings.emergencyClosed = false;
    } else {
      settings.manuallyOpened = false;
      settings.emergencyClosed = true;
    }
    
    settings.updatedBy = req.admin._id;
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    res.json({
      success: true,
      message: `System ${action === 'open' ? 'manually opened' : 'emergency closed'} successfully`,
      data: settings
    });
  } catch (error) {
    console.error("Emergency toggle error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle system status"
    });
  }
});
module.exports = router;
