const mongoose = require('mongoose');
const Animal = require('./server/models/Animal');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/halt-donation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixCharlieImage() {
  try {
    console.log('🔍 Looking for Charlie...');
    
    // Find Charlie
    const charlie = await Animal.findOne({ name: 'Charlie' });
    if (!charlie) {
      console.log('❌ Charlie not found');
      return;
    }
    
    console.log('✅ Found Charlie:', charlie.name, 'ID:', charlie._id);
    console.log('Current image:', charlie.images[0]?.url || 'No image');
    
    // Update with a reliable cockatiel image
    const newImageUrl = 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=400&fit=crop&crop=center';
    
    // Test if the new URL works
    const https = require('https');
    const testUrl = (url) => {
      return new Promise((resolve) => {
        https.get(url, (res) => {
          resolve(res.statusCode === 200);
        }).on('error', () => {
          resolve(false);
        });
      });
    };
    
    console.log('🔍 Testing new image URL...');
    const urlWorks = await testUrl(newImageUrl);
    
    if (!urlWorks) {
      console.log('❌ New URL is not accessible, trying alternative...');
      // Try a different cockatiel image
      const altUrl = 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop&crop=center';
      const altWorks = await testUrl(altUrl);
      
      if (altWorks) {
        console.log('✅ Alternative URL works');
        charlie.images = [{
          url: altUrl,
          altText: 'Charlie the Cockatiel',
          isPrimary: true
        }];
      } else {
        console.log('❌ Both URLs failed, using a simple placeholder');
        charlie.images = [{
          url: 'https://via.placeholder.com/400x400/87CEEB/000000?text=Charlie+Cockatiel',
          altText: 'Charlie the Cockatiel',
          isPrimary: true
        }];
      }
    } else {
      console.log('✅ New URL works');
      charlie.images = [{
        url: newImageUrl,
        altText: 'Charlie the Cockatiel',
        isPrimary: true
      }];
    }
    
    // Save the update
    await charlie.save();
    console.log('✅ Charlie\'s image updated successfully!');
    console.log('New image URL:', charlie.images[0].url);
    
  } catch (error) {
    console.error('❌ Error updating Charlie:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixCharlieImage();
