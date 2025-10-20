require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Story = require('./models/Story');

async function testStory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const testStory = new Story({
      title: 'Test Story',
      excerpt: 'This is a test story excerpt',
      content: 'This is the test story content',
      category: 'News',
      featuredImage: {
        url: '/images/test.jpg',
        altText: 'Test image'
      },
      isPublished: true
    });
    
    console.log('Before save - slug:', testStory.slug);
    const saved = await testStory.save();
    console.log('After save - slug:', saved.slug);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testStory();
