require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

// 🔑 CHANGE YOUR ADMIN KEY HERE
const ADMIN_KEY = "0219$0216!haltAdminKey";
// 🔑 CHANGE YOUR ADMIN KEY HERE

async function setAdminKey() {
  try {
    console.log('🔐 Setting up admin key authentication...');
    
    const keyData = {
      adminKey: ADMIN_KEY,
      createdAt: new Date().toISOString(),
      description: "Admin key for HALT Shelter admin panel access"
    };
    
    // Save to a JSON file
    const keyFilePath = path.join(__dirname, 'admin-key.json');
    fs.writeFileSync(keyFilePath, JSON.stringify(keyData, null, 2));
    
    console.log('✅ Admin key has been set successfully!');
    console.log('🔑 Admin Key:', ADMIN_KEY);
    console.log('📁 Key saved to:', keyFilePath);
    console.log('\n🔧 You can now use this key to login to the admin panel.');
    console.log('💡 To change the key, edit this script and run it again.');
    
  } catch (error) {
    console.error('❌ Failed to set admin key:', error);
  }
}

setAdminKey();
