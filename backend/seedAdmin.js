const mongoose = require('mongoose');
const Admin = require('./models/admin');
require('dotenv').config();

const DEFAULT_PASSWORD = 'SecureAdminPassword456!'; 

const MONGODB_URI = 'mongodb+srv://eyobadb:12345@cluster0.lmkhnbn.mongodb.net/university_clearance?retryWrites=true&w=majority';

const seedAdmin = async () => {
  try {
    // 1. Connect to the database (using your MongoDB Atlas URI)
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas.");

    const defaultEmail = "admin@university.edu";

    // 2. Check if admin exists using the defined default email
    const existingAdmin = await Admin.findOne({ email: defaultEmail });
    if (existingAdmin) {
      console.log(`⚠️ Admin with email ${defaultEmail} already exists. Seeding skipped.`);
      console.log(`You can login with:\n📧 Email: ${defaultEmail}\n🔑 Password: The one you set previously`);
      process.exit(0);
    }

    // 3. Create initial admin instance
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
    console.log('\n🚨 IMPORTANT SECURITY NOTES:');
    console.log('1. Change this password immediately after first login!');
    console.log('2. Remove or change the default password in this file');
    console.log('3. Consider using environment variables for credentials');
    
    console.log('\n🔗 MongoDB Atlas Connection:');
    console.log('Database: university_clearance');
    console.log('Cluster: Cluster0');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Admin:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if MongoDB Atlas cluster is running');
    console.error('2. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('3. Check if database user "eyobadb" has correct permissions');
    process.exit(1);
  }
};

seedAdmin();