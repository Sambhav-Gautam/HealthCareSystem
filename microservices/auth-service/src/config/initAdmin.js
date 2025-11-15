const User = require('../models/User');

const initializeDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@healthcare.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        password: 'Admin@123456',
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
        isVerified: true,
      });
      console.log('✅ Default admin created:');
      console.log('   Email: admin@healthcare.com');
      console.log('   Password: Admin@123456');
      console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

module.exports = { initializeDefaultAdmin };

