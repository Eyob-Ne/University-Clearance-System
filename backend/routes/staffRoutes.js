const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Clearance = require("../models/clearanceRequest");
const { staffProtect } = require("../middleware/auth");
const Staff = require("../models/staff");

/**
 * GET /api/staff/students
 * - If staff.role === "Department Head" => return students where department == staff.department
 * - Else (library/finance/registrar/dormitory etc) => return all students
 */
router.get("/students", staffProtect, async (req, res) => {
  try {
    const staff = req.staff;
    let clearances;

    if (staff.role && staff.role.toLowerCase().includes("department")) {
      // Department head: only their department students
      clearances = await Clearance.find({ department: staff.department })
        .populate("studentId", "studentId fullName department");
    } else {
      // Service staff: all students
      clearances = await Clearance.find()
        .populate("studentId", "studentId fullName department");
    }

    // Format response to match frontend expectations
    const students = clearances.map(c => ({
      _id: c.studentId._id,
      studentId: c.studentId.studentId,
      fullName: c.studentId.fullName,
      department: c.studentId.department,
      clearance: {
        department: c.departmentStatus,
        library: c.libraryStatus,
        dormitory: c.dormStatus,
        finance: c.financeStatus,
        registrar: c.registrarStatus,
        cafeteria: c.cafeteriaStatus,
        overall: c.overallStatus
      },
      // NEW: Include clearance reasons in response
      clearanceReasons: {
        department: c.departmentReason || "",
        library: c.libraryReason || "",
        dormitory: c.dormReason || "",
        finance: c.financeReason || "",
        registrar: c.registrarReason || "",
        cafeteria: c.cafeteriaReason || ""
      }
    }));

    res.json({ students });
  } catch (err) {
    console.error("GET /api/staff/students error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/staff/clear/:studentId
 * Body: { 
 *   section: "library" | "dormitory" | "finance" | ... , 
 *   status: "Pending"|"Cleared"|"Rejected",
 *   reason: "string" (optional, required when status is "Rejected")
 * }
 */
router.put("/clear/:studentId", staffProtect, async (req, res) => {
  try {
    const staff = req.staff;
    const { studentId } = req.params;
    let { section, status, reason } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });
    if (!["Pending", "Cleared", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "Rejected" && (!reason || reason.trim() === "")) {
      return res.status(400).json({ message: "Reason is required when rejecting" });
    }

    const clearance = await Clearance.findOne({ studentId });
    if (!clearance) return res.status(404).json({ message: "Clearance record not found" });

    let fieldToUpdate = "";
    let reasonField = "";
    let departmentLabel = "";

    if (staff.role && staff.role.toLowerCase().includes("department")) {
      fieldToUpdate = "departmentStatus";
      reasonField = "departmentReason";
      departmentLabel = staff.department || "Department";
    } else {
      const fieldMap = {
        library: "libraryStatus",
        dormitory: "dormStatus",
        finance: "financeStatus",
        registrar: "registrarStatus",
        cafeteria: "cafeteriaStatus"
      };

      const reasonMap = {
        library: "libraryReason",
        dormitory: "dormReason",
        finance: "financeReason",
        registrar: "registrarReason",
        cafeteria: "cafeteriaReason"
      };

      fieldToUpdate = fieldMap[section];
      reasonField = reasonMap[section];
      departmentLabel = section;

      if (!fieldToUpdate) {
        return res.status(400).json({ message: "Invalid section for update" });
      }
    }

    // update status
    clearance[fieldToUpdate] = status;

    if (status === "Rejected") {
      clearance[reasonField] = reason.trim();
    } else {
      clearance[reasonField] = "";
    }

    // ⭐ ADD APPROVAL HISTORY
    clearance.approvalHistory.push({
      department: departmentLabel,
      approvedBy: staff.name || staff.email || "Staff",
      status,
      reason: status === "Rejected" ? reason : "",
      date: new Date()
    });

    await clearance.save();

    await Student.findByIdAndUpdate(studentId, {
      clearanceStatus: clearance.overallStatus
    });

    res.json({
      message: "Clearance updated successfully",
      clearance
    });

  } catch (err) {
    console.error("PUT /api/staff/clear error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/staff/bulk-update
 * Body: {
 *   ids: [array of student IDs],
 *   section: "library" | "dormitory" | ...,
 *   status: "Cleared" | "Rejected",
 *   reason: "string" (optional, required when status is "Rejected")
 * }
 */
router.put("/bulk-update", staffProtect, async (req, res) => {
  try {
    const staff = req.staff;
    const { ids, section, status, reason } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No students selected" });
    }

    if (!["Cleared", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "Rejected" && (!reason || reason.trim() === "")) {
      return res.status(400).json({ message: "Reason is required when rejecting" });
    }

    let fieldToUpdate = "";
    let reasonField = "";
    let departmentLabel = "";

    if (staff.role && staff.role.toLowerCase().includes("department")) {
      fieldToUpdate = "departmentStatus";
      reasonField = "departmentReason";
      departmentLabel = staff.department || "Department";
    } else {
      const fieldMap = {
        library: "libraryStatus",
        dormitory: "dormStatus",
        finance: "financeStatus",
        registrar: "registrarStatus",
        cafeteria: "cafeteriaStatus"
      };

      const reasonMap = {
        library: "libraryReason",
        dormitory: "dormReason",
        finance: "financeReason",
        registrar: "registrarReason",
        cafeteria: "cafeteriaReason"
      };

      fieldToUpdate = fieldMap[section];
      reasonField = reasonMap[section];
      departmentLabel = section;

      if (!fieldToUpdate) {
        return res.status(400).json({ message: "Invalid section provided" });
      }
    }

    const clearances = await Clearance.find({ studentId: { $in: ids } });

    const updatePromises = clearances.map(async (doc) => {
      doc[fieldToUpdate] = status;

      if (status === "Rejected") {
        doc[reasonField] = reason.trim();
      } else {
        doc[reasonField] = "";
      }

      // ⭐ ADD APPROVAL HISTORY
      doc.approvalHistory.push({
        department: departmentLabel,
        approvedBy: staff.name || staff.email || "Staff",
        status,
        reason: status === "Rejected" ? reason : "",
        date: new Date()
      });

      await doc.save();

      await Student.findByIdAndUpdate(doc.studentId, {
        clearanceStatus: doc.overallStatus
      });
    });

    await Promise.all(updatePromises);

    res.json({
      message: `Successfully updated ${clearances.length} students`,
      count: clearances.length
    });

  } catch (err) {
    console.error("BULK UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error during bulk update" });
  }
});

// Profile and other routes remain unchanged
router.put("/profile", staffProtect, async (req, res) => {
  try {
    const { fullName, name, email, currentPassword, newPassword } = req.body;
    const staff = await Staff.findById(req.staff._id);

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff not found' 
      });
    }

    // Handle both name and fullName (frontend sends fullName)
    const nameToUpdate = fullName || name;
    if (nameToUpdate && nameToUpdate.trim() !== '' && nameToUpdate !== staff.name) {
      staff.name = nameToUpdate.trim();
    }

    // Update email if provided and different
    if (email && email.trim() !== '' && email !== staff.email) {
      const existingStaff = await Staff.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: req.staff._id }
      });

      if (existingStaff) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use by another staff member' 
        });
      }

      staff.email = email.toLowerCase().trim();
    }

    // Handle password change if provided
    if (currentPassword && newPassword) {
      const isPasswordValid = await staff.matchPassword(currentPassword);
      
      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password must be at least 6 characters long' 
        });
      }

      // Assign new password — pre-save hook will hash it
      staff.password = newPassword;
    } else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both current password and new password are required to change password' 
      });
    }

    // Save staff (this triggers pre-save hook for hashing)
    await staff.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: staff._id,
        name: staff.name,
        fullName: staff.name,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Validate staff email
// @route   POST /api/staff/validate-email
// @access  Private
router.post("/validate-email", staffProtect, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if email exists (excluding current staff)
    const existingStaff = await Staff.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: req.staff._id }
    });

    res.json({
      success: true,
      data: {
        email,
        isAvailable: !existingStaff,
        message: existingStaff ? 'Email already in use' : 'Email is available'
      }
    });

  } catch (error) {
    console.error('Validate email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;