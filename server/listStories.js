const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Story = require('./models/Story');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

async function listStories() {
  await connectDB();
  const stories = await Story.find({}, { title: 1, slug: 1, category: 1, isPublished: 1, createdAt: 1 }).sort({ createdAt: 1 });
  if (!stories.length) {
    console.log('No stories found.');
  } else {
    stories.forEach(story => {
      console.log(`- ${story.title} | slug: ${story.slug} | category: ${story.category} | published: ${story.isPublished}`);
    });
  }
  process.exit(0);
}

listStories();