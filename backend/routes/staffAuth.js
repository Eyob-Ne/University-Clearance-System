// server/routes/staffAuth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/staff"); // make sure this path matches your project

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const TOKEN_EXPIRY = "7d";

// POST /api/staff/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: staff._id, role: staff.role, department: staff.department || "" },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      message: "Login successful",
      token,
      staff: {
        id: staff._id,
        name: staff.name,         
        fullName: staff.name,        
        email: staff.email,
        role: staff.role,
       department: staff.department || null,
      },
    });
  } catch (err) {
    console.error("Staff login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
