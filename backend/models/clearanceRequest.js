const mongoose = require("mongoose");

const clearanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        unique: true
    },

    // Department Status (Academic)
    department: {
        type: String,
        required: true,
    },

    departmentStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    // Other Clearance Sections
    libraryStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    dormStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    financeStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    registrarStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    cafeteriaStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    overallStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"], // Changed to "Approved" to match Student model
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Update overall status before saving
clearanceSchema.pre('save', function(next) {
    const statuses = [
        this.departmentStatus,
        this.libraryStatus,
        this.dormStatus,
        this.financeStatus,
        this.registrarStatus,
        this.cafeteriaStatus
    ];

    // If any section is rejected, overall is rejected
    if (statuses.includes("Rejected")) {
        this.overallStatus = "Rejected";
    } 
    // If all sections are cleared, overall is approved
    else if (statuses.every(status => status === "Cleared")) {
        this.overallStatus = "Approved";
    } 
    // Otherwise, pending
    else {
        this.overallStatus = "Pending";
    }
    
    next();
});

module.exports = mongoose.model("Clearance", clearanceSchema);