// Run this file once using: node backend/seedAdmin.js
const mongoose = require('mongoose');
const Admin = require('./models/Admin'); // Ensure this path correctly points to your Admin model
require('dotenv').config();

// Use the password defined in the script
const DEFAULT_PASSWORD = 'SecureAdminPassword456!'; 

const seedAdmin = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_clearance');
    console.log("✅ Connected to MongoDB.");

    const defaultEmail = "admin@university.edu";

    // 2. Check if admin exists using the defined default email
    const existingAdmin = await Admin.findOne({ email: defaultEmail });
    if (existingAdmin) {
      console.log(`⚠️ Admin with email ${defaultEmail} already exists. Seeding skipped.`);
      process.exit(0);
    }

    // 3. Create initial admin instance
    // Since your Admin model has a pre('save') hook, creating a new instance
    // and calling .save() will automatically hash the password.
    const admin = new Admin({
      name: 'System Administrator',
      email: defaultEmail,
      password: DEFAULT_PASSWORD,
      role: "admin" // Ensures the role is set correctly
    });
    
    await admin.save();

    console.log('✅ Initial Admin Created Successfully!');
    console.log(`\t📧 Email: ${defaultEmail}`);
    console.log(`\t🔑 Temporary Password: ${DEFAULT_PASSWORD}`);
    console.log('🚨 IMPORTANT: Remember to update this password immediately after the first login.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Admin:', error.message);
    // Log the entire error object if needed for detailed debugging
    // console.error(error); 
    process.exit(1);
  }
};

seedAdmin();