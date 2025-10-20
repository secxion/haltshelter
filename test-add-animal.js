// Quick test to add a sample animal for testing
const mongoose = require('mongoose');
require('dotenv').config();

const Animal = require('./server/models/Animal');

async function addTestAnimal() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test animal
    const testAnimal = new Animal({
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 'Adult',
      gender: 'Male',
      size: 'Large',
      description: 'Buddy is a friendly and energetic Golden Retriever who loves playing fetch and going on long walks. He\'s great with kids and other dogs!',
      status: 'Available',
      isSpayedNeutered: true,
      isVaccinated: true,
      isMicrochipped: true,
      adoptionFee: 150,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
          altText: 'Buddy the Golden Retriever',
          isPrimary: true
        }
      ]
    });

    await testAnimal.save();
    console.log('✅ Test animal "Buddy" created successfully!');
    
    // Also create another test animal
    const testAnimal2 = new Animal({
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Maine Coon',
      age: 'Young',
      gender: 'Female',
      size: 'Medium',
      description: 'Whiskers is a beautiful Maine Coon who loves to cuddle and purr. She\'s very gentle and would make a perfect lap cat.',
      status: 'Available',
      isSpayedNeutered: true,
      isVaccinated: true,
      isMicrochipped: false,
      adoptionFee: 100,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
          altText: 'Whiskers the Maine Coon',
          isPrimary: true
        }
      ]
    });

    await testAnimal2.save();
    console.log('✅ Test animal "Whiskers" created successfully!');

    // List all animals
    const allAnimals = await Animal.find();
    console.log(`\n📊 Total animals in database: ${allAnimals.length}`);
    allAnimals.forEach(animal => {
      console.log(`- ${animal.name} (${animal.species}, ${animal.status})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

addTestAnimal();
