const express = require("express");
const router = express.Router();
const ClearanceSettings = require("../models/ClearanceSettings");

// Public endpoint to check system status
router.get("/status", async (req, res) => {
  try {
    const settings = await ClearanceSettings.getCurrentSettings();
    const status = settings.isSystemOpen();
    
    // Calculate time remaining
    const calculateTimeRemaining = (ms) => {
      if (!ms || ms <= 0) return null;
      
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${days}d ${hours}h ${minutes}m`;
    };
    
    res.json({
      success: true,
      data: {
        isOpen: status.isOpen,
        message: status.reason,
        type: status.type,
        schedule: {
          startDate: settings.startDate,
          endDate: settings.endDate,
          isActive: settings.isActive
        },
        timeRemaining: status.timeRemaining ? calculateTimeRemaining(status.timeRemaining) : null,
        opensIn: status.opensIn ? calculateTimeRemaining(status.opensIn) : null,
        nextOpening: status.type === 'before_opening' ? settings.startDate : null,
        lastClosed: status.type === 'after_closing' ? settings.endDate : null
      }
    });
  } catch (error) {
    console.error("System status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get system status"
    });
  }
});

module.exports = router;