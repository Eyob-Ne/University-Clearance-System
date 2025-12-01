// middleware/auth.js
const jwt = require("jsonwebtoken");
const Student = require("../models/student");
const Admin = require("../models/admin");
const Staff = require("../models/staff");

const protect = async (req, res, next) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");

    // Fetch department (without password)
    const department = await Department.findById(decoded.id).select("-password");

    if (!department) {
      return res.status(401).json({ error: "Department not found." });
    }

    // Attach department to request
    req.department = department;
    req.departmentId = department._id;

    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

const protectStudent = async (req, res, next) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");

    // Fetch student (without password)
    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      return res.status(401).json({ error: "Student not found." });
    }

    // Attach student to request
    req.student = student;
    req.studentId = student._id;

    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.admin = await Admin.findById(decoded.id).select("-password");

      if (!req.admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid admin token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Admin authorization required" });
  }
};

async function staffProtect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ message: "Not authorized" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    const staff = await Staff.findById(decoded.id).select("-password");
    if (!staff) return res.status(401).json({ message: "Staff not found" });

    req.staff = staff;
    next();
  } catch (err) {
    console.error("staffProtect error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
module.exports = { protect, protectStudent,adminProtect,staffProtect };