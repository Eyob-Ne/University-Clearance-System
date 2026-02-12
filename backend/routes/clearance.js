const express = require("express");
const router = express.Router();
const Clearance = require("../models/clearanceRequest");
const Student = require("../models/student");
const { protectStudent } = require("../middleware/auth");
const checkClearanceWindow = require("../middleware/clearanceWindow");

// ------------------------------------------
// Start Clearance Process
// ------------------------------------------
router.post("/start", protectStudent, checkClearanceWindow, async (req, res) => {
    try {
        const studentId = req.student._id;

        // Check if record exists
        let clearance = await Clearance.findOne({ studentId });

        if (clearance) {
            return res.status(200).json({
                alreadyExists: true,
                message: "Clearance already started.",
                clearance
            });
        }

        // Fetch student info
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // ✅ FIXED: Don't create system pending entries - start with empty array
        // The approvalHistory should only contain actual actions, not initial states
        const approvalHistory = []; // Empty array instead of 6 system entries

        // Create clearance
        clearance = await Clearance.create({
            studentId,
            department: student.department,
            departmentStatus: "Pending",
            libraryStatus: "Pending",
            dormStatus: "Pending",
            financeStatus: "Pending",
            registrarStatus: "Pending",
            cafeteriaStatus: "Pending",
            overallStatus: "Pending",
            approvalHistory // Now empty array
        });

        // Update student's clearance status
        student.clearanceStatus = "Pending";
        await student.save();

        res.status(201).json({
            success: true,
            message: "Clearance started successfully.",
            clearance,
        });

    } catch (err) {
        console.error("Error starting clearance:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// ------------------------------------------
// Get student clearance (with history)
// ------------------------------------------
router.get("/me", protectStudent, async (req, res) => {
    try {
        const studentId = req.student._id;

        const clearance = await Clearance.findOne({ studentId })
            .populate("studentId", "studentId fullName department year");

        if (!clearance) {
            return res.status(404).json({
                message: "No clearance record found. Please start clearance process first."
            });
        }

        // ✅ FIXED: Filter out any system-generated pending entries from the history
        // This ensures old records don't show the unwanted entries
        const filteredHistory = clearance.approvalHistory.filter(entry => 
            !(entry.approvedBy === "System" && entry.status === "Pending")
        );

        res.json({
            clearance: {
                departmentStatus: clearance.departmentStatus,
                libraryStatus: clearance.libraryStatus,
                dormStatus: clearance.dormStatus,
                financeStatus: clearance.financeStatus,
                registrarStatus: clearance.registrarStatus,
                cafeteriaStatus: clearance.cafeteriaStatus,
                overallStatus: clearance.overallStatus,
                createdAt: clearance.createdAt
            },

            clearanceReasons: {
                department: clearance.departmentReason || "",
                library: clearance.libraryReason || "",
                dormitory: clearance.dormReason || "",
                finance: clearance.financeReason || "",
                registrar: clearance.registrarReason || "",
                cafeteria: clearance.cafeteriaReason || ""
            },

            // ✅ Return filtered history instead of raw array
            approvalHistory: filteredHistory || []
        });

    } catch (err) {
        console.error("Error fetching clearance:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;