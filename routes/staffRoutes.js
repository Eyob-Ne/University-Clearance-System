const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Clearance = require("../models/clearanceRequest");
const { staffProtect } = require("../middleware/auth");

// Allowed generic sections (for non-department roles)
const ALLOWED_SECTIONS = ["library", "dormitory", "finance", "registrar", "cafeteria"];

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
        // Map clearance fields to the structure expected by frontend
        department: c.departmentStatus,
        library: c.libraryStatus,
        dormitory: c.dormStatus,
        finance: c.financeStatus,
        registrar: c.registrarStatus,
        cafeteria: c.cafeteriaStatus,
        overall: c.overallStatus
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
 * Body: { section: "library" | "dormitory" | "finance" | ... , status: "Pending"|"Cleared"|"Rejected" }
 */
router.put("/clear/:studentId", staffProtect, async (req, res) => {
  try {
    const staff = req.staff;
    const { studentId } = req.params;
    let { section, status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });
    if (!["Pending", "Cleared", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find clearance record
    const clearance = await Clearance.findOne({ studentId });
    if (!clearance) return res.status(404).json({ message: "Clearance record not found" });

    let fieldToUpdate = "";
    
    if (staff.role && staff.role.toLowerCase().includes("department")) {
      fieldToUpdate = "departmentStatus";
    } else {
      // Map section to field name in Clearance model
      const fieldMap = {
        "library": "libraryStatus",
        "dormitory": "dormStatus", 
        "finance": "financeStatus",
        "registrar": "registrarStatus",
        "cafeteria": "cafeteriaStatus"
      };
      fieldToUpdate = fieldMap[section];
      
      if (!fieldToUpdate) {
        return res.status(400).json({ message: "Invalid section for update" });
      }
    }

    // Update the specific field
    clearance[fieldToUpdate] = status;

    // Save will trigger the pre-save hook to update overallStatus
    await clearance.save();

    // Also update the student's clearanceStatus to match overallStatus
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

router.put("/bulk-update", staffProtect, async (req, res) => {
  try {
    const staff = req.staff;
    // 1. Grab 'ids' instead of 'studentIds' to match frontend
    const { ids, section, status } = req.body; 

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No students selected" });
    }
    if (!["Cleared", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 2. Determine which field to update (Same logic as single update)
    let fieldToUpdate = "";
    if (staff.role && staff.role.toLowerCase().includes("department")) {
      fieldToUpdate = "departmentStatus";
    } else {
      const fieldMap = {
        "library": "libraryStatus",
        "dormitory": "dormStatus",
        "finance": "financeStatus",
        "registrar": "registrarStatus",
        "cafeteria": "cafeteriaStatus"
      };
      fieldToUpdate = fieldMap[section];
      
      if (!fieldToUpdate) {
        return res.status(400).json({ message: "Invalid section provided" });
      }
    }

    // 3. Update the CLEARANCE model, not the STUDENT model
    // We fetch the documents first so we can save() them one by one.
    // Why? Because .save() triggers the logic that calculates "Overall Status". 
    // updateMany() does NOT trigger that logic.
    
    const clearances = await Clearance.find({ studentId: { $in: ids } });

    if (clearances.length === 0) {
        return res.status(404).json({ message: "No clearance records found for selected students" });
    }

    const updatePromises = clearances.map(async (doc) => {
      // Update the specific department status
      doc[fieldToUpdate] = status;
      
      // Save the clearance document (this should trigger your pre-save hooks for overall status)
      await doc.save();

      // Sync with Student Model (Just like your single update route does)
      await Student.findByIdAndUpdate(doc.studentId, {
        clearanceStatus: doc.overallStatus
      });
    });

    // Wait for all updates to finish
    await Promise.all(updatePromises);

    res.json({ 
      message: `Successfully updated ${clearances.length} students to ${status}`, 
      count: clearances.length 
    });

  } catch (err) {
    console.error("BULK UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error during bulk update" });
  }
});
router.get("/debug/db", async (req, res) => {
  try {
    const students = await Student.find();
    const clearances = await Clearance.find();

    res.json({
      studentCount: students.length,
      clearanceCount: clearances.length,
      firstStudent: students[0],
      firstClearance: clearances[0]
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;