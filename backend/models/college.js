const mongoose = require('mongoose');

// Check if model already exists before creating
let College;
if (mongoose.models.College) {
  College = mongoose.models.College;
} else {
  const collegeSchema = new mongoose.Schema({
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      unique: true,
      minlength: [3, 'College name must be at least 3 characters'],
      maxlength: [100, 'College name cannot exceed 100 characters']
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

  // Update the updatedAt field on save
  collegeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  College = mongoose.model('College', collegeSchema);
}

module.exports = College;