const mongoose = require('mongoose');
// Load .env automatically so scripts and server code can pick up MONGODB_URI
try {
  require('dotenv').config();
} catch (e) {
  // ignore - dotenv may not be installed in some environments
}

const normalizeMongoUri = (raw) => {
  if (!raw || typeof raw !== 'string') return raw;
  // If credentials appear in the URI (mongodb://user:pass@host...), ensure they are URL-encoded
  // Match scheme (mongodb or mongodb+srv), credentials, and the rest
  const m = raw.match(/^(mongodb(?:\+srv)?:\/\/)([^@]+)@(.+)$/);
  if (!m) return raw;
  const scheme = m[1];
  const creds = m[2];
  const rest = m[3];
  // If creds already look encoded (%), skip encoding
  if (/%[0-9A-Fa-f]{2}/.test(creds)) return raw;
  const idx = creds.indexOf(':');
  if (idx === -1) {
    // only username present
    return scheme + encodeURIComponent(creds) + '@' + rest;
  }
  const user = creds.slice(0, idx);
  const pass = creds.slice(idx + 1);
  return scheme + encodeURIComponent(user) + ':' + encodeURIComponent(pass) + '@' + rest;
};

const connectDB = async () => {
  // Graceful shutdown: register early so it's always reachable regardless of control flow
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
    } catch (e) {
      // ignore
    }
    process.exit(0);
  });
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // normalize possible env var names and encode credentials if needed
    const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGOURL;
    const uri = normalizeMongoUri(rawUri);

    // Try primary connection first
    try {
      const conn = await mongoose.connect(uri, {
        // Mongoose 6+ no longer needs these options as they're defaults
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      // Register events and return
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected');
      });
      return true;
    } catch (initialErr) {
      // If SRV lookup timed out or failed for mongodb+srv URIs, attempt fallback
      console.warn('⚠️ Primary Mongo connection failed:', initialErr.message);
      if (rawUri && typeof rawUri === 'string' && rawUri.startsWith('mongodb+srv://')) {
        try {
          const dns = require('dns').promises;
          // extract credentials and cluster part
          const m = rawUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/]+)(\/.*)?$/);
          if (m) {
            const creds = m[1];
            const cluster = m[2];
            const rest = m[3] || '';
            // resolve SRV records
            const srvName = `_mongodb._tcp.${cluster}`;
            const records = await dns.resolveSrv(srvName);
            const hosts = records.map(r => `${r.name}:${r.port}`);
            // Reconstruct a standard mongodb:// URI using the discovered hosts
            const idx = creds.indexOf(':');
            const user = idx === -1 ? creds : creds.slice(0, idx);
            const pass = idx === -1 ? '' : creds.slice(idx + 1);
            const encodedUser = encodeURIComponent(user);
            const encodedPass = encodeURIComponent(pass);
            const hostList = hosts.join(',');
            const fallbackUri = `mongodb://${encodedUser}${pass ? ':' + encodedPass : ''}@${hostList}${rest}`;
            console.log('➡️ Attempting fallback MongoDB URI (direct hosts):', hostList);
            const connFallback = await mongoose.connect(fallbackUri, {});
            console.log(`✅ MongoDB Connected (fallback): ${connFallback.connection.host}`);
            mongoose.connection.on('error', (err) => {
              console.error('❌ MongoDB connection error:', err);
            });
            mongoose.connection.on('disconnected', () => {
              console.log('🔌 MongoDB disconnected');
            });
            // Graceful shutdown already registered below; return true to signal success
            return true;
          }
        } catch (fallbackErr) {
          console.warn('⚠️ SRV fallback attempt failed:', fallbackErr.message);
        }
      }
      // rethrow original error to be handled by outer catch
      throw initialErr;
    }
    


  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Server will continue running without database connectivity');
    console.log('🔧 To fix: Check your MongoDB Atlas IP whitelist and connection string');
    return false;
  }
};

module.exports = connectDB;
