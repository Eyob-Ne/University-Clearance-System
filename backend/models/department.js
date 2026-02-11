const mongoose = require('mongoose');

// Check if model already exists before creating
let Department;
if (mongoose.models.Department) {
  Department = mongoose.models.Department;
} else {
  const departmentSchema = new mongoose.Schema({
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      minlength: [3, 'Department name must be at least 3 characters'],
      maxlength: [100, 'Department name cannot exceed 100 characters']
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College reference is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  // Compound index for unique department names per college
  departmentSchema.index({ departmentName: 1, collegeId: 1 }, { unique: true });

  // Update the updatedAt field on save
  departmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  Department = mongoose.model('Department', departmentSchema);
}

module.exports = Department;