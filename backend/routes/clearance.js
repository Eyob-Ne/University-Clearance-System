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
        });

        // Update student's clearanceStatus
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

// UPDATED: Get student clearance with reasons
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

        // UPDATED: Include clearance reasons in response
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
            // NEW: Add clearance reasons to response
            clearanceReasons: {
                department: clearance.departmentReason || "",
                library: clearance.libraryReason || "",
                dormitory: clearance.dormReason || "",
                finance: clearance.financeReason || "",
                registrar: clearance.registrarReason || "",
                cafeteria: clearance.cafeteriaReason || ""
            }
        });

    } catch (err) {
        console.error("Error fetching clearance:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;