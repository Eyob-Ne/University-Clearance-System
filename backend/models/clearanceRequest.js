const mongoose = require("mongoose");
const sendStatusEmail = require("../utils/sendStatusEmail");
const Student = require("./student");
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

    // NEW: Department rejection reason
    departmentReason: {
        type: String,
        default: ""
    },

    // Other Clearance Sections
    libraryStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    // NEW: Library rejection reason
    libraryReason: {
        type: String,
        default: ""
    },

    dormStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    // NEW: Dorm rejection reason
    dormReason: {
        type: String,
        default: ""
    },

    financeStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    // NEW: Finance rejection reason
    financeReason: {
        type: String,
        default: ""
    },

    registrarStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    // NEW: Registrar rejection reason
    registrarReason: {
        type: String,
        default: ""
    },

    cafeteriaStatus: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending"
    },

    // NEW: Cafeteria rejection reason
    cafeteriaReason: {
        type: String,
        default: ""
    },
  approvalHistory: [
        {
            department: {
                type: String,
                required: true
            },
            approvedBy: {
                type: String,
                required: true // Remove default, make required
            },
            status: {
                type: String,
                enum: ["Pending", "Cleared", "Rejected"],
                required: true
            },
            reason: {
                type: String,
                default: ""
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    overallStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
    
}, 
{
    timestamps: true // Add this to track createdAt and updatedAt
});

// Update overall status before saving
clearanceSchema.pre('save', async function(next) {
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
     if (!this.isNew) {
        const existing = await this.constructor.findById(this._id);
        this._previousOverallStatus = existing?.overallStatus;
    }
    
    next();
});
clearanceSchema.post('save', async function(doc) {
    try {
        if (!this._previousOverallStatus) return;

        const oldStatus = this._previousOverallStatus;
        const newStatus = doc.overallStatus;

        if (
           oldStatus !== newStatus && 
            (newStatus === "Rejected" || newStatus === "Approved")
        ) {

            // Get student info
            const student = await Student.findById(doc.studentId);

            if (student && student.email) {
                await sendStatusEmail(
                    student.email,
                    student.fullName || student.name || "Student",
                    newStatus.toLowerCase()
                );

                console.log(`📧 Email sent to ${student.email} for ${newStatus}`);
            }
        }

    } catch (error) {
        console.error("❌ Error sending status email:", error);
    }
});


module.exports = mongoose.model("Clearance", clearanceSchema);