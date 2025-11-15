require('dotenv').config();
const mongoose = require('mongoose');

// Simple Doctor schema for seeding
const doctorSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  specialty: String,
  qualification: String,
  licenseNumber: String,
  experience: Number,
  consultationFee: Number,
  department: String,
  bio: String,
  isAvailable: Boolean,
  rating: {
    average: Number,
    count: Number
  }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

const sampleDoctors = [
  {
    userId: new mongoose.Types.ObjectId(),
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@hospital.com',
    phone: '9876543210',
    specialty: 'Cardiology',
    qualification: 'MD, DM (Cardiology)',
    licenseNumber: 'MED-CARD-2024-001',
    experience: 15,
    consultationFee: 800,
    department: 'Cardiology',
    bio: 'Experienced cardiologist with 15 years of practice',
    isAvailable: true,
    rating: { average: 4.8, count: 150 }
  },
  {
    userId: new mongoose.Types.ObjectId(),
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@hospital.com',
    phone: '9876543211',
    specialty: 'Pediatrics',
    qualification: 'MD (Pediatrics)',
    licenseNumber: 'MED-PEDI-2024-002',
    experience: 10,
    consultationFee: 600,
    department: 'Pediatrics',
    bio: 'Child health specialist with focus on preventive care',
    isAvailable: true,
    rating: { average: 4.9, count: 200 }
  },
  {
    userId: new mongoose.Types.ObjectId(),
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@hospital.com',
    phone: '9876543212',
    specialty: 'Orthopedics',
    qualification: 'MS (Orthopedics)',
    licenseNumber: 'MED-ORTHO-2024-003',
    experience: 12,
    consultationFee: 700,
    department: 'Orthopedics',
    bio: 'Sports injury and joint replacement specialist',
    isAvailable: true,
    rating: { average: 4.7, count: 120 }
  },
  {
    userId: new mongoose.Types.ObjectId(),
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@hospital.com',
    phone: '9876543213',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD',
    licenseNumber: 'MED-GEN-2024-004',
    experience: 8,
    consultationFee: 500,
    department: 'General Medicine',
    bio: 'General physician for all common health concerns',
    isAvailable: true,
    rating: { average: 4.6, count: 180 }
  },
  {
    userId: new mongoose.Types.ObjectId(),
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@hospital.com',
    phone: '9876543214',
    specialty: 'Dermatology',
    qualification: 'MD (Dermatology)',
    licenseNumber: 'MED-DERM-2024-005',
    experience: 9,
    consultationFee: 650,
    department: 'Dermatology',
    bio: 'Skin care and cosmetic dermatology expert',
    isAvailable: true,
    rating: { average: 4.8, count: 95 }
  }
];

async function seedDoctors() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hcl_medical_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const doctors = await Doctor.insertMany(sampleDoctors);
    console.log(`✅ Successfully added ${doctors.length} doctors:`);
    
    doctors.forEach(doc => {
      console.log(`   - Dr. ${doc.firstName} ${doc.lastName} (${doc.specialty})`);
    });

    console.log('\n🎉 Doctors added! You can now see them in appointment booking!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDoctors();

