const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/halt_shelter', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Test the adoption inquiry API
const testAdoptionInquiry = async () => {
  try {
    await connectDB();
    
    // First, get available animals
    const Animal = require('./server/models/Animal');
    const animals = await Animal.find({ status: 'Available' });
    
    if (animals.length === 0) {
      console.log('❌ No available animals found. Please add animals first.');
      return;
    }
    
    const testAnimal = animals[0];
    console.log(`🐕 Testing with animal: ${testAnimal.name} (${testAnimal._id})`);
    
    // Create test adoption inquiry
    const AdoptionInquiry = require('./server/models/AdoptionInquiry');
    
    const testInquiry = new AdoptionInquiry({
      animal: testAnimal._id,
      applicantName: 'John Smith',
      applicantEmail: 'john.smith@email.com',
      applicantPhone: '(555) 123-4567',
      applicantAddress: '123 Main Street, Springfield, IL 62701',
      petExperience: 'I have had dogs my entire life. I currently have a 3-year-old Golden Retriever named Max, and I am looking for a companion for him. I have experience with training, grooming, and providing medical care.',
      message: `I am very interested in adopting ${testAnimal.name}. I have a large fenced yard and work from home, so I can provide lots of attention and exercise. I would love to schedule a meet and greet.`
    });
    
    await testInquiry.save();
    console.log('✅ Test adoption inquiry created successfully!');
    console.log(`📋 Inquiry ID: ${testInquiry._id}`);
    console.log(`📧 Applicant: ${testInquiry.applicantName} (${testInquiry.applicantEmail})`);
    console.log(`🐕 Animal: ${testAnimal.name}`);
    console.log(`📅 Status: ${testInquiry.status}`);
    
    // Create another inquiry with different status
    const testInquiry2 = new AdoptionInquiry({
      animal: testAnimal._id,
      applicantName: 'Sarah Johnson',
      applicantEmail: 'sarah.johnson@email.com',
      applicantPhone: '(555) 987-6543',
      applicantAddress: '456 Oak Avenue, Springfield, IL 62702',
      petExperience: 'I am a first-time pet owner but have done extensive research on pet care. I have taken a pet care course and have prepared my home for a new companion.',
      message: `${testAnimal.name} looks like such a sweet ${testAnimal.species.toLowerCase()}! I have been looking for the perfect pet to join my family and I believe ${testAnimal.name} would be a great fit.`,
      status: 'Under Review'
    });
    
    await testInquiry2.save();
    console.log('✅ Second test adoption inquiry created successfully!');
    console.log(`📋 Inquiry ID: ${testInquiry2._id}`);
    console.log(`📧 Applicant: ${testInquiry2.applicantName} (${testInquiry2.applicantEmail})`);
    console.log(`📅 Status: ${testInquiry2.status}`);
    
    // Get total count
    const totalInquiries = await AdoptionInquiry.countDocuments();
    console.log(`📊 Total adoption inquiries in database: ${totalInquiries}`);
    
    // Test query with population
    const inquiriesWithAnimals = await AdoptionInquiry.find()
      .populate('animal', 'name species breed status')
      .sort({ createdAt: -1 });
    
    console.log('\n📋 All Adoption Inquiries:');
    inquiriesWithAnimals.forEach((inquiry, index) => {
      console.log(`${index + 1}. ${inquiry.applicantName} wants to adopt ${inquiry.animal.name} (${inquiry.animal.species}) - Status: ${inquiry.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing adoption inquiries:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the test
console.log('🧪 Testing Adoption Inquiry System...\n');
testAdoptionInquiry();
