const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  // Existing fields from CSV upload:
  studentId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    uppercase: true
  },
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  department: { 
    type: String, 
    required: true
  },
  year: { 
    type: String, 
    required: true
  },
  
  // New registration fields (set by student):
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    sparse: true // Allows multiple nulls
  },
  
  password: { 
    type: String
  },
  otp: {
  code: String,
  expires: Date
},
  // Account status fields:
  accountStatus: {
    type: String,
    enum: ['Unclaimed', 'PendingVerification', 'Active', 'Suspended'],
    default: 'Unclaimed'
  },
  
  // Existing clearance fields:
  clearanceStatus: { 
    type: String, 
    enum: ['Pending', 'Cleared', 'Rejected'],
    default: 'Pending'
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
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