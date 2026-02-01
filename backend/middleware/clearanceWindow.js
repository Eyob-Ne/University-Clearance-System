const ClearanceSettings = require("../models/ClearanceSettings");

const checkClearanceWindow = async (req, res, next) => {
  try {
    const settings = await ClearanceSettings.getCurrentSettings();
    const systemStatus = settings.isSystemOpen();
    
    if (!systemStatus.isOpen) {
      // Format dates for better response
      const formatDate = (date) => {
        if (!date) return null;
        return date.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      return res.status(403).json({
        success: false,
        message: systemStatus.reason,
        type: systemStatus.type,
        opensAt: systemStatus.type === 'before_opening' ? formatDate(settings.startDate) : null,
        closedAt: systemStatus.type === 'after_closing' ? formatDate(settings.endDate) : null,
        currentSettings: {
          startDate: settings.startDate,
          endDate: settings.endDate,
          isActive: settings.isActive
        }
      });
    }
    
    // System is open, continue
    req.clearanceSettings = settings;
    next();
  } catch (error) {
    console.error("Clearance window check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking system availability. Please try again later."
    });
  }
};

module.exports = checkClearanceWindow;