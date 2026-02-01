const mongoose = require("mongoose");

const ClearanceSettingsSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  manuallyOpened: {
    type: Boolean,
    default: false,
  },
  emergencyClosed: {
    type: Boolean,
    default: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Static method to get current settings
ClearanceSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings (opens tomorrow, lasts 5 days)
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() + 1);
    defaultStart.setHours(0, 0, 0, 0);
    
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultEnd.getDate() + 4);
    defaultEnd.setHours(23, 59, 59, 999);
    
    settings = await this.create({
      startDate: defaultStart,
      endDate: defaultEnd,
      isActive: true,
      manuallyOpened: false,
      emergencyClosed: false
    });
  }
  
  return settings;
};

// Method to check if system is open
ClearanceSettingsSchema.methods.isSystemOpen = function() {
  const now = new Date();
  
  // 1. Emergency close - highest priority
  if (this.emergencyClosed) {
    return {
      isOpen: false,
      reason: "System is emergency closed by administration",
      type: "emergency"
    };
  }
  
  // 2. Manual override - second priority
  if (this.manuallyOpened) {
    return {
      isOpen: true,
      reason: "System is manually opened by administration",
      type: "manual"
    };
  }
  
  // 3. Auto scheduling check
  if (this.isActive) {
    if (now >= this.startDate && now <= this.endDate) {
      return {
        isOpen: true,
        reason: "Clearance system is open",
        type: "scheduled",
        timeRemaining: this.endDate - now
      };
    } else if (now < this.startDate) {
      return {
        isOpen: false,
        reason: "Clearance system has not opened yet",
        type: "before_opening",
        opensIn: this.startDate - now
      };
    } else {
      return {
        isOpen: false,
        reason: "Clearance system has closed",
        type: "after_closing"
      };
    }
  }
  
  // 4. Auto scheduling disabled
  return {
    isOpen: false,
    reason: "Clearance system is not scheduled to open",
    type: "inactive"
  };
};

module.exports = mongoose.model("ClearanceSettings", ClearanceSettingsSchema);