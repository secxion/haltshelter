const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Sample volunteer data
const sampleVolunteers = [
  {
    personalInfo: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
      dateOfBirth: new Date('1992-05-15'),
      address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701"
      }
    },
    interests: ["animal-care", "dog-walking", "administrative"],
    experience: {
      animalExperience: "3 years of pet sitting and dog walking",
      volunteerExperience: "Volunteered at local food bank for 2 years"
    },
    availability: {
      weekdays: {
        monday: { available: false, timeSlots: [] },
        tuesday: { available: true, timeSlots: ["morning", "afternoon"] },
        wednesday: { available: true, timeSlots: ["evening"] },
        thursday: { available: false, timeSlots: [] },
        friday: { available: true, timeSlots: ["afternoon"] }
      },
      weekends: {
        saturday: { available: true, timeSlots: ["morning", "afternoon"] },
        sunday: { available: false, timeSlots: [] }
      },
      hoursPerWeek: "7-10"
    },
    applicationStatus: "pending"
  },
  {
    personalInfo: {
      firstName: "Michael",
      lastName: "Chen",
      email: "m.chen@email.com",
      phone: "(555) 987-6543",
      dateOfBirth: new Date('1988-11-22'),
      address: {
        street: "456 Oak Ave",
        city: "Springfield",
        state: "IL",
        zipCode: "62702"
      }
    },
    interests: ["cat-socialization", "photography", "events"],
    experience: {
      animalExperience: "Owned cats for 10+ years, fostered rescue kittens",
      volunteerExperience: "Event planning experience with community center"
    },
    availability: {
      weekdays: {
        monday: { available: false, timeSlots: [] },
        tuesday: { available: false, timeSlots: [] },
        wednesday: { available: false, timeSlots: [] },
        thursday: { available: false, timeSlots: [] },
        friday: { available: false, timeSlots: [] }
      },
      weekends: {
        saturday: { available: true, timeSlots: ["morning", "afternoon", "evening"] },
        sunday: { available: true, timeSlots: ["afternoon"] }
      },
      hoursPerWeek: "4-6"
    },
    applicationStatus: "approved"
  },
  {
    personalInfo: {
      firstName: "Emma",
      lastName: "Rodriguez",
      email: "emma.rodriguez@email.com",
      phone: "(555) 456-7890",
      dateOfBirth: new Date('1995-03-08'),
      address: {
        street: "789 Pine St",
        city: "Springfield",
        state: "IL",
        zipCode: "62703"
      }
    },
    interests: ["fundraising", "social-media", "administrative"],
    experience: {
      animalExperience: "Limited experience but eager to learn",
      volunteerExperience: "Social media volunteer for local nonprofit"
    },
    availability: {
      weekdays: {
        monday: { available: true, timeSlots: ["evening"] },
        tuesday: { available: true, timeSlots: ["evening"] },
        wednesday: { available: true, timeSlots: ["evening"] },
        thursday: { available: true, timeSlots: ["evening"] },
        friday: { available: false, timeSlots: [] }
      },
      weekends: {
        saturday: { available: false, timeSlots: [] },
        sunday: { available: true, timeSlots: ["morning"] }
      },
      hoursPerWeek: "4-6"
    },
    applicationStatus: "contacted"
  }
];

const createTestVolunteers = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Could not connect to database');
    process.exit(1);
  }

  try {
    // Import the Volunteer model
    const { Volunteer } = require('./server/models');
    
    // Check if volunteers already exist
    const existingCount = await Volunteer.countDocuments();
    console.log(`📊 Found ${existingCount} existing volunteer applications`);
    
    if (existingCount === 0) {
      console.log('🔄 Creating sample volunteer applications...');
      
      for (const volunteerData of sampleVolunteers) {
        const volunteer = new Volunteer(volunteerData);
        await volunteer.save();
        console.log(`✅ Created volunteer: ${volunteer.personalInfo.firstName} ${volunteer.personalInfo.lastName}`);
      }
      
      console.log('🎉 Sample volunteer data created successfully!');
    } else {
      console.log('ℹ️  Volunteer applications already exist, skipping sample data creation');
    }
    
  } catch (error) {
    console.error('❌ Error creating test volunteers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
createTestVolunteers();
