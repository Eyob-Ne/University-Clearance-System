const express = require('express');
const router = express.Router();
const Department = require('../models/department');
const College = require('../models/college');
const { adminProtect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(adminProtect);

// GET /api/admin/departments - Get all departments (with college filter)
router.get('/college-departments', async (req, res) => {
  try {
    const { collegeId } = req.query;
    
    let query = {};
    if (collegeId) {
      query.collegeId = collegeId;
    }

    const departments = await Department.find(query)
      .populate('collegeId', 'collegeName')
      .sort({ departmentName: 1 })
      .lean();

    const formattedDepartments = departments.map(dept => ({
      departmentId: dept._id,
      departmentName: dept.departmentName,
      collegeId: dept.collegeId._id,
      collegeName: dept.collegeId.collegeName,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt
    }));

    res.status(200).json(formattedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
});

// POST /api/admin/departments - Create a new department
router.post('/college-departments', async (req, res) => {
  try {
    const { departmentName, collegeId } = req.body;

    // Validation
    if (!departmentName || departmentName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID is required'
      });
    }

    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Check if department already exists in this college
    const existingDepartment = await Department.findOne({
      collegeId,
      departmentName: { $regex: new RegExp(`^${departmentName.trim()}$`, 'i') }
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists in this college'
      });
    }

    // Create new department
    const department = new Department({
      departmentName: departmentName.trim(),
      collegeId
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: {
        departmentId: department._id,
        departmentName: department.departmentName,
        collegeId: department.collegeId,
        createdAt: department.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating department:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists in this college'
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid college ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
});

// PUT /api/admin/departments/:id - Update a department
router.put('/college-departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentName } = req.body;

    // Validation
    if (!departmentName || departmentName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if new name already exists in same college
    const existingDepartment = await Department.findOne({
      _id: { $ne: id },
      collegeId: department.collegeId,
      departmentName: { $regex: new RegExp(`^${departmentName.trim()}$`, 'i') }
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Another department with this name already exists in this college'
      });
    }

    // Update department
    department.departmentName = departmentName.trim();
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department: {
        departmentId: department._id,
        departmentName: department.departmentName,
        updatedAt: department.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating department:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists in this college'
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
});

// DELETE /api/admin/departments/:id - Delete a department
router.delete('/college-departments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // TODO: Add check for students/staff assigned to this department
    // For now, allow deletion
    // const hasStudents = await Student.exists({ departmentId: id });
    // if (hasStudents) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete department because it has students assigned'
    //   });
    // }

    // Delete department
    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message
    });
  }
});

module.exports = router;