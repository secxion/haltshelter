const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Add 8 new diverse animals
const addNewAnimals = async () => {
  try {
    await connectDB();
    
    const Animal = require('./server/models/Animal');
    
    const newAnimals = [
      {
        name: "Daisy",
        species: "Goat",
        breed: "Dwarf Goat",
        age: "Young",
        gender: "Female",
        size: "Small",
        description: "Daisy is a friendly dwarf goat who loves attention and treats. She's great with children and other farm animals.",
        images: [{
          url: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
          altText: "Daisy the Dwarf Goat",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 200,
        intakeDate: new Date()
      },
      {
        name: "Pepper",
        species: "Guinea Pig",
        breed: "Abyssinian",
        age: "Adult",
        gender: "Male",
        size: "Small",
        description: "Pepper is a sweet guinea pig with a distinctive rosette coat. He loves to popcorn and enjoys fresh vegetables.",
        images: [{
          url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400",
          altText: "Pepper the Guinea Pig",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 50,
        intakeDate: new Date()
      },
      {
        name: "Sunny",
        species: "Bird",
        breed: "Cockatiel",
        age: "Young",
        gender: "Female",
        size: "Small",
        description: "Sunny is a beautiful cockatiel who loves to whistle and sing. She's very social and enjoys interacting with people.",
        images: [{
          url: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400",
          altText: "Sunny the Cockatiel",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: false,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 125,
        intakeDate: new Date()
      },
      {
        name: "Clover",
        species: "Rabbit",
        breed: "Mini Lop",
        age: "Adult",
        gender: "Male",
        size: "Small",
        description: "Clover is a gentle mini lop rabbit who loves to explore and play. He's litter trained and enjoys being petted.",
        images: [{
          url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400",
          altText: "Clover the Mini Lop Rabbit",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 85,
        intakeDate: new Date()
      },
      {
        name: "Hazel",
        species: "Ferret",
        breed: "Domestic Ferret",
        age: "Young",
        gender: "Female",
        size: "Small",
        description: "Hazel is a playful ferret who loves to explore and play hide and seek. She's very curious and entertaining to watch.",
        images: [{
          url: "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=400",
          altText: "Hazel the Ferret",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 175,
        intakeDate: new Date()
      },
      {
        name: "Ruby",
        species: "Pig",
        breed: "Miniature Pig",
        age: "Young",
        gender: "Female",
        size: "Medium",
        description: "Ruby is an intelligent miniature pig who loves belly rubs and treats. She's house-trained and very affectionate.",
        images: [{
          url: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
          altText: "Ruby the Miniature Pig",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 300,
        intakeDate: new Date()
      },
      {
        name: "Storm",
        species: "Bird",
        breed: "Parakeet",
        age: "Adult",
        gender: "Male",
        size: "Small",
        description: "Storm is a vibrant blue parakeet who loves to chatter and play with toys. He's very social and enjoys company.",
        images: [{
          url: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400",
          altText: "Storm the Parakeet",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: false,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 75,
        intakeDate: new Date()
      },
      {
        name: "Olive",
        species: "Turtle",
        breed: "Red-Eared Slider",
        age: "Adult",
        gender: "Female",
        size: "Small",
        description: "Olive is a calm turtle who enjoys basking in the sun and swimming. She requires an aquatic setup with proper heating and filtration.",
        images: [{
          url: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400",
          altText: "Olive the Turtle",
          isPrimary: true
        }],
        status: "Available",
        isSpayedNeutered: false,
        isVaccinated: false,
        isMicrochipped: false,
        specialNeeds: true,
        adoptionFee: 100,
        intakeDate: new Date()
      }
    ];

    console.log('🐾 Adding 8 new diverse animals...\n');

    for (const animalData of newAnimals) {
      try {
        const animal = new Animal(animalData);
        await animal.save();
        console.log(`✅ Added ${animalData.name} (${animalData.species} - ${animalData.breed})`);
      } catch (error) {
        console.error(`❌ Error adding ${animalData.name}:`, error.message);
      }
    }

    // Get final count
    const totalAnimals = await Animal.countDocuments();
    const availableAnimals = await Animal.countDocuments({ status: 'Available' });
    
    console.log('\n📊 Final Statistics:');
    console.log(`Total Animals: ${totalAnimals}`);
    console.log(`Available for Adoption: ${availableAnimals}`);
    
    // Show all animals by species
    const animalsBySpecies = await Animal.aggregate([
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n🐾 Animals by Species:');
    animalsBySpecies.forEach(group => {
      console.log(`${group._id}: ${group.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding animals:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
console.log('🚀 Adding 8 diverse animals to HALT Shelter...\n');
addNewAnimals();
