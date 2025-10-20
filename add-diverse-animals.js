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

// Add diverse animals to the database
const addDiverseAnimals = async () => {
  try {
    await connectDB();
    
    const Animal = require('./server/models/Animal');
    
    const diverseAnimals = [
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
    },
    {
      name: 'Cocoa',
      species: 'Rabbit',
      breed: 'Holland Lop',
      age: 'Young',
      gender: 'Female',
      size: 'Small',
      description: 'Cocoa is an adorable Holland Lop rabbit with beautiful chocolate-colored fur. She loves to hop around and enjoys fresh vegetables and hay. Perfect for families with children!',
      images: [{
        url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400',
        altText: 'Cocoa the Holland Lop Rabbit',
        isPrimary: true
      }],
      status: 'Available',
      isSpayedNeutered: true,
      isVaccinated: true,
      isMicrochipped: false,
      specialNeeds: false,
      adoptionFee: 75,
      tags: ['gentle', 'family-friendly', 'indoor']
    },
      {
        name: 'Biscuit',
        species: 'Goat',
        breed: 'Nigerian Dwarf',
        age: 'Adult',
        gender: 'Male',
        size: 'Medium',
        description: 'Biscuit is a friendly Nigerian Dwarf goat who loves attention and treats. He\'s great with other goats and enjoys climbing on playground equipment. Requires outdoor space with proper fencing.',
        images: [{
          url: 'https://images.unsplash.com/photo-1518135714426-c2e1b6834250?w=400',
          altText: 'Biscuit the Nigerian Dwarf Goat',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 200,
        tags: ['social', 'outdoor', 'farm-animal']
      },
      {
        name: 'Feathers',
        species: 'Bird',
        breed: 'Cockatiel',
        age: 'Adult',
        gender: 'Male',
        size: 'Small',
        description: 'Feathers is a beautiful gray cockatiel who loves to whistle and can learn simple words. He enjoys socializing and would do well with an experienced bird owner who can provide daily interaction.',
        images: [{
          url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400',
          altText: 'Feathers the Cockatiel',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: false,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 125,
        tags: ['social', 'vocal', 'intelligent']
      },
      {
        name: 'Patches',
        species: 'Guinea Pig',
        breed: 'American',
        age: 'Young',
        gender: 'Female',
        size: 'Small',
        description: 'Patches is a sweet guinea pig with beautiful patches of brown and white fur. She loves munching on vegetables and chattering with her cage mates. Would prefer to be adopted with another guinea pig.',
        images: [{
          url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400',
          altText: 'Patches the Guinea Pig',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: true,
        isVaccinated: false,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 50,
        tags: ['social', 'quiet', 'pair-bond']
      },
      {
        name: 'Hopper',
        species: 'Rabbit',
        breed: 'Mini Rex',
        age: 'Adult',
        gender: 'Male',
        size: 'Small',
        description: 'Hopper is a gentle Mini Rex rabbit with incredibly soft fur. He\'s litter trained and enjoys being petted. He would make a wonderful indoor companion for a quiet household.',
        images: [{
          url: 'https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?w=400',
          altText: 'Hopper the Mini Rex Rabbit',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 80,
        tags: ['calm', 'litter-trained', 'soft']
      },
      {
        name: 'Clover',
        species: 'Goat',
        breed: 'Pygmy',
        age: 'Young',
        gender: 'Female',
        size: 'Small',
        description: 'Clover is a playful Pygmy goat who loves to jump and climb. She\'s very social and gets along well with other farm animals. Needs a home with adequate outdoor space and companionship.',
        images: [{
          url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400',
          altText: 'Clover the Pygmy Goat',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: false,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 175,
        tags: ['playful', 'social', 'climber']
      },
      {
        name: 'Sunny',
        species: 'Bird',
        breed: 'Canary',
        age: 'Adult',
        gender: 'Male',
        size: 'Small',
        description: 'Sunny is a beautiful yellow canary with an amazing singing voice. He brings joy with his melodious songs, especially in the morning. Perfect for someone who appreciates birdsong.',
        images: [{
          url: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=400',
          altText: 'Sunny the Canary',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: false,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 75,
        tags: ['singer', 'cheerful', 'morning-song']
      },
      {
        name: 'Nibbles',
        species: 'Guinea Pig',
        breed: 'Peruvian',
        age: 'Adult',
        gender: 'Male',
        size: 'Small',
        description: 'Nibbles is a long-haired Peruvian guinea pig with gorgeous flowing locks. He requires regular grooming but is very gentle and loves being handled. Great for experienced guinea pig owners.',
        images: [{
          url: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=400',
          altText: 'Nibbles the Peruvian Guinea Pig',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: true,
        isVaccinated: false,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 60,
        tags: ['long-hair', 'gentle', 'grooming-needed']
      },
      {
        name: 'Pepper',
        species: 'Ferret',
        breed: 'Domestic',
        age: 'Young',
        gender: 'Female',
        size: 'Small',
        description: 'Pepper is an energetic and playful ferret who loves to explore and play with toys. She\'s very social and would benefit from lots of interaction and playtime. Requires ferret-proofed home.',
        images: [{
          url: 'https://images.unsplash.com/photo-1615963244664-5b845b2025ee?w=400',
          altText: 'Pepper the Ferret',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: true,
        isVaccinated: true,
        isMicrochipped: true,
        specialNeeds: false,
        adoptionFee: 150,
        tags: ['energetic', 'playful', 'explorer']
      },
      {
        name: 'Willow',
        species: 'Sheep',
        breed: 'Babydoll Southdown',
        age: 'Young',
        gender: 'Female',
        size: 'Medium',
        description: 'Willow is a gentle Babydoll Southdown sheep with incredibly soft wool. She\'s calm and friendly, getting along well with other farm animals. Perfect for a small farm or homestead setting.',
        images: [{
          url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
          altText: 'Willow the Babydoll Southdown Sheep',
          isPrimary: true
        }],
        status: 'Available',
        isSpayedNeutered: false,
        isVaccinated: true,
        isMicrochipped: false,
        specialNeeds: false,
        adoptionFee: 250,
        tags: ['gentle', 'woolly', 'farm-animal']
      }
    ];
    
    console.log('🐰 Adding 10 diverse animals to the database...\n');
    
    for (const animalData of diverseAnimals) {
      try {
        const animal = new Animal(animalData);
        await animal.save();
        console.log(`✅ Added ${animalData.name} (${animalData.species} - ${animalData.breed})`);
      } catch (error) {
        console.error(`❌ Error adding ${animalData.name}:`, error.message);
      }
    }
    
    // Get total count of all animals
    const totalAnimals = await Animal.countDocuments();
    const availableAnimals = await Animal.countDocuments({ status: 'Available' });
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   Total Animals: ${totalAnimals}`);
    console.log(`   Available Animals: ${availableAnimals}`);
    
    // Show breakdown by species
    const speciesBreakdown = await Animal.aggregate([
      { $match: { status: 'Available' } },
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`\n🐾 Available Animals by Species:`);
    speciesBreakdown.forEach(species => {
      console.log(`   ${species._id}: ${species.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding diverse animals:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
console.log('🌟 Adding Diverse Animals to HALT Shelter Database...\n');
addDiverseAnimals();
