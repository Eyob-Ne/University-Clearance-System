const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  department: {
    type: String,
    required: true,
    trim: true
  },

  year: {
    type: Number,
    required: true
  },

  // Each department updates this: { library: "Cleared", dormitory: "Pending", ... }
  clearance: {
    type: Map,
    of: {
      type: String,
      enum: ["Pending", "Cleared", "Rejected"]
    },
    default: {}
  },

  clearanceStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null
  },
  
  resetPasswordExpires: {
    type: Date,
    default: null
  },

  dateCreated: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password during login
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update overall clearance status when departments update clearance
studentSchema.methods.updateOverallClearance = function () {
  if (!this.clearance || this.clearance.size === 0) {
    this.clearanceStatus = "Pending";
    return;
  }

  const values = Array.from(this.clearance.values());
  const allCleared = values.length > 0 && values.every(v => v === "Cleared");

  this.clearanceStatus = allCleared ? "Approved" : "Pending";
};

module.exports = mongoose.model("Student", studentSchema);