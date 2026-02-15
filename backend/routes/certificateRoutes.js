const express = require("express");
const router = express.Router();
const PDFGenerator = require("../utils/pdfGenerator");
const Certificate = require("../models/certificate");
const Student = require("../models/student");
const Clearance = require("../models/clearanceRequest");
const { protectStudent } = require("../middleware/auth");

// Generate clearance certificate
router.post("/generate", protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.clearanceStatus !== "Approved") {
      return res.status(400).json({
        error: "Clearance not completed. Please complete all clearance procedures first."
      });
    }

    // ✅ 1️⃣ Check for existing active certificate
    let existingCertificate = await Certificate.findOne({
      studentId: student._id,
      status: "active"
    });

    let certificateId;
    let expiryDate;
    let pdfBuffer;

    if (existingCertificate) {
      // ✅ Reuse existing certificate
      certificateId = existingCertificate.certificateId;
      expiryDate = existingCertificate.expiryDate;

      const result = await PDFGenerator.generateFromExisting(
        student,
        existingCertificate
      );

      pdfBuffer = result.pdfBuffer;

    } else {
      // ✅ Create new certificate
      const result = await PDFGenerator.generateClearanceCertificate(student);

      certificateId = result.certificateId;
      expiryDate = result.expiryDate;
      pdfBuffer = result.pdfBuffer;
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="MAU-Clearance-${student.studentId}.pdf"`,
      "Content-Length": pdfBuffer.length
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
});


// Verify certificate
router.get("/verify/:certificateCode", async (req, res) => {
  try {
    const certificateCode = req.params.certificateCode;
    const parts = certificateCode.split('-');
    
    if (parts.length < 4) {
      return res.status(400).json({ 
        valid: false, 
        message: "Invalid certificate code format" 
      });
    }

    const securityHash = parts.pop();
    const certificateId = parts.join('-');

    const certificate = await Certificate.findOne({ 
      certificateId,
      securityHash 
    }).populate('studentId', 'studentId fullName department year');

    if (!certificate) {
      return res.json({ 
        valid: false, 
        message: "❌ Certificate not found or invalid" 
      });
    }

    const clearance = await Clearance.findOne({ studentId: certificate.studentId._id });

// ✅ COMBINED: Clean and concise version
const filteredHistory = (clearance?.approvalHistory || [])
  .filter(entry => 
    entry.status === "Cleared" && 
    entry.approvedBy && 
    !(entry.approvedBy === "System" && entry.status === "Pending")
  )
  .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Check expiry
    const now = new Date();
    if (now > certificate.expiryDate) {
      certificate.status = 'expired';
      await certificate.save();
    }

    // Update verification stats
    certificate.verificationCount += 1;
    certificate.lastVerified = now;
    await certificate.save();

    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil((certificate.expiryDate - now) / (1000 * 60 * 60 * 24));

    res.json({
      valid: certificate.status === 'active',
      certificate: {
        id: certificate.certificateId,
        student: certificate.studentId,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        status: certificate.status,
        verificationCount: certificate.verificationCount,
        lastVerified: certificate.lastVerified,
        daysUntilExpiry: daysUntilExpiry,
        // ✅ Return only real approvals, no system entries
        approvalHistory: filteredHistory
      },
      message: certificate.status === 'active' 
        ? `✅ Valid certificate (Expires in ${daysUntilExpiry} days)`
        : '❌ Certificate has expired'
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ 
      valid: false, 
      message: "❌ Verification error" 
    });
  }
});
// Get student's active certificates
router.get("/my-certificates", protectStudent, async (req, res) => {
  try {
    const certificates = await Certificate.find({ 
      studentId: req.student.id 
    }).sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

module.exports = router;