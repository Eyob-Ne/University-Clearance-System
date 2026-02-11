const express = require('express');
const router = express.Router();
const College = require('../models/college');
const mongoose = require('mongoose');
const Department = require('../models/department');
const { adminProtect } = require('../middleware/auth');
router.use(adminProtect);

// GET /api/admin/colleges - Get all colleges with department count
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find({})
      .sort({ collegeName: 1 })
      .select('collegeName createdAt updatedAt')
      .lean();

    const result = await Promise.all(
      colleges.map(async (college) => {
        const departmentCount = await Department.countDocuments({ 
          collegeId: college._id 
        });
        
        return {
          collegeId: college._id.toString(),
          collegeName: college.collegeName,
          createdAt: college.createdAt,
          updatedAt: college.updatedAt,
          departmentCount
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in GET /colleges:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/admin/colleges - Create a new college
router.post('/colleges', async (req, res) => {
  try {
    const { collegeName } = req.body;

    // Validation
    if (!collegeName || collegeName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'College name is required'
      });
    }

    // Check if college already exists
    const existingCollege = await College.findOne({
      collegeName: { $regex: new RegExp(`^${collegeName.trim()}$`, 'i') }
    });

    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: 'College with this name already exists'
      });
    }

    // Create new college
    const college = new College({
      collegeName: collegeName.trim()
    });

    await college.save();

    res.status(201).json({
      success: true,
      message: 'College created successfully',
      college: {
        collegeId: college._id,
        collegeName: college.collegeName,
        createdAt: college.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating college:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'College with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create college',
      error: error.message
    });
  }
});

// PUT /api/admin/colleges/:id - Update a college
router.put('/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { collegeName } = req.body;

    // Validation
    if (!collegeName || collegeName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'College name is required'
      });
    }

    // Check if college exists
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Check if new name already exists (excluding current college)
    const existingCollege = await College.findOne({
      _id: { $ne: id },
      collegeName: { $regex: new RegExp(`^${collegeName.trim()}$`, 'i') }
    });

    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: 'Another college with this name already exists'
      });
    }

    // Update college
    college.collegeName = collegeName.trim();
    await college.save();

    res.status(200).json({
      success: true,
      message: 'College updated successfully',
      college: {
        collegeId: college._id,
        collegeName: college.collegeName,
        updatedAt: college.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating college:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'College with this name already exists'
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
      message: 'Failed to update college',
      error: error.message
    });
  }
});

// DELETE /api/admin/colleges/:id - Delete a college
router.delete('/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if college exists
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Check if college has departments
    const hasDepartments = await Department.exists({ collegeId: id });
    if (hasDepartments) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete college because it has departments assigned. Please delete departments first.'
      });
    }

    // Delete college
    await college.deleteOne();

    res.status(200).json({
      success: true,
      message: 'College deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting college:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid college ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete college',
      error: error.message
    });
  }
});

// GET /api/admin/colleges/:id - Get single college with departments
router.get('/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: 'collegeId',
          as: 'departments',
          pipeline: [
            { $sort: { departmentName: 1 } },
            { $project: { _id: 1, departmentName: 1, createdAt: 1 } }
          ]
        }
      },
      {
        $project: {
          collegeName: 1,
          createdAt: 1,
          updatedAt: 1,
          departments: 1
        }
      }
    ]);

    if (!college || college.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.status(200).json({
      success: true,
      college: {
        collegeId: college[0]._id,
        collegeName: college[0].collegeName,
        createdAt: college[0].createdAt,
        departments: college[0].departments.map(dept => ({
          departmentId: dept._id,
          departmentName: dept.departmentName,
          createdAt: dept.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching college:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid college ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch college',
      error: error.message
    });
  }
});

module.exports = router;