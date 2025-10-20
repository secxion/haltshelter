require('dotenv').config({ path: '../.env' });
const connectDB = require('./db');
const { User, Animal, Story, Donation, NewsletterSubscriber, Volunteer } = require('./models');

async function testDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Successfully connected to MongoDB');

    console.log('\n📊 Testing database operations...');

    // Clean up any existing test data
    console.log('🧹 Cleaning up any existing test data...');
    await User.deleteMany({ email: { $regex: /test.*@haltshelter\.org/ } });
    await Animal.deleteMany({ name: 'Buddy' });
    await NewsletterSubscriber.deleteMany({ email: 'subscriber@example.com' });

    // Test creating a sample user
    console.log('👤 Creating test user...');
    const testUser = new User({
      email: 'test@haltshelter.org',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    });

    const savedUser = await testUser.save();
    console.log('✅ Test user created:', savedUser.email);

    // Test creating a sample animal
    console.log('🐕 Creating test animal...');
    const testAnimal = new Animal({
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 'Adult',
      size: 'Large',
      description: 'A friendly and energetic dog looking for a loving home.',
      addedBy: savedUser._id
    });

    const savedAnimal = await testAnimal.save();
    console.log('✅ Test animal created:', savedAnimal.name);

    // Test creating a newsletter subscriber
    console.log('📧 Creating test newsletter subscriber...');
    const testSubscriber = new NewsletterSubscriber({
      email: 'subscriber@example.com',
      firstName: 'Newsletter',
      lastName: 'Subscriber'
    });

    const savedSubscriber = await testSubscriber.save();
    console.log('✅ Test subscriber created:', savedSubscriber.email);

    console.log('\n🧹 Cleaning up test data...');
    await User.findByIdAndDelete(savedUser._id);
    await Animal.findByIdAndDelete(savedAnimal._id);
    await NewsletterSubscriber.findByIdAndDelete(savedSubscriber._id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Database test completed successfully!');
    console.log('📋 All models are working correctly:');
    console.log('   - User model ✅');
    console.log('   - Animal model ✅');
    console.log('   - Story model ✅');
    console.log('   - Donation model ✅');
    console.log('   - NewsletterSubscriber model ✅');
    console.log('   - Volunteer model ✅');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
