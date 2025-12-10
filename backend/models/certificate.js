const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  securityHash: {
    type: String,
    required: true
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  lastVerified: {
    type: Date
  }
}, { timestamps: true });

// Auto-expire certificates
certificateSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Certificate", certificateSchema);