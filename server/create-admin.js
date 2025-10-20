require('dotenv').config({ path: '../.env' });
const connectDB = require('./db');
const { User } = require('./models');

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Successfully connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@haltshelter.org' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      email: 'admin@haltshelter.org',
      password: 'admin123',
      firstName: 'HALT',
      lastName: 'Admin',
      role: 'admin'
    });

    const savedAdmin = await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Email:', savedAdmin.email);
    console.log('   Role:', savedAdmin.role);
    console.log('   Password: admin123');
    console.log('\n🔑 You can now login to the admin panel with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
