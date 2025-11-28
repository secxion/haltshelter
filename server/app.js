/**
 * Express Server Refactored for Monorepo Deployment on Render.
 * * Key Changes:
 * 1. Simplified dotenv config to look for .env in the project root.
 * 2. Simplified Trust Proxy configuration for Render/Production.
 * 3. Refactored Admin Login to exclusively use the secure ADMIN_KEY environment variable.
 * 4. Corrected static file serving to point to a standard frontend build directory ('./dist').
 * 5. Improved global error handling.
 */

// --- 1. Dependencies and Environment Setup ---
require('dotenv').config(); // Looks for .env in the current working directory

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import database connection and models
const connectDB = require('./db'); 
const {
  Animal,
  Story,
  Blog,
  Donation,
  NewsletterSubscriber,
  Volunteer,
  User
} = require('./models');

// --- 2. Initialization and Configuration ---
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');

// Trust proxy for Render/load balancers
if (isProduction || process.env.RENDER) {
  app.set('trust proxy', 1);
} else {
  // Simplified for local development/testing
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : false);
}

// Connect to MongoDB
connectDB().then((connected) => {
  console.log(connected ? '✅ Database ready for operations' : '⚠️ Running in database-free mode');
});

// --- 3. Global Middleware ---
// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://js.stripe.com",
          "https://checkout.stripe.com",
          "https://m.stripe.network"
        ],
        connectSrc: ["'self'", "https://api.stripe.com", "https://checkout.stripe.com", "https://m.stripe.network"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com", "https://m.stripe.network"]
      }
    }
  })
);

// CORS setup
const whitelist = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://192.168.56.1:3001'
];
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean).forEach(o => whitelist.push(o));
}
if (isProduction) {
  if (process.env.FRONTEND_URL) whitelist.push(process.env.FRONTEND_URL);
  if (process.env.ADMIN_URL) whitelist.push(process.env.ADMIN_URL);
}
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); 
      if (whitelist.includes(origin)) return callback(null, true);
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

// Logging
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Stripe webhook (must be raw body and placed before body parsers)
const donationsWebhookHandler = require('./routes/donations-webhook');
app.post('/api/donations/webhook', express.raw({ type: 'application/json' }), donationsWebhookHandler);

// Body parsers (after webhook)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 4. Custom Routes & Handlers ---

// Uploads static serving
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Placeholder image
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#6b7280" text-anchor="middle" dy=".3em">Rescue Story</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});

// --- 5. Route Mounting ---

console.log('📦 Loading API routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/adoption-inquiries', require('./routes/adoption-inquiries'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/org-settings', require('./routes/org-settings'));
app.use('/api/notification-settings', require('./routes/notification-settings'));
app.use('/api/admin-key', require('./routes/admin-key'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/stats', require('./routes/stats'));

// Admin routes
app.use('/api/admin/animals', require('./routes/admin-animals'));
app.use('/api/admin/adoption-inquiries', require('./routes/admin-adoption-inquiries'));
app.use('/api/admin/stats', require('./routes/admin-stats'));


// --- 6. Admin Key Auth (Refactored for ENV variable) ---
app.get('/api/admin-auth/test', (req, res) => {
  res.json({ message: 'Direct admin auth working!', timestamp: new Date().toISOString() });
});

app.post('/api/admin-auth/admin-login', (req, res) => {
  const { adminKey } = req.body;
  try {
    const storedAdminKey = process.env.ADMIN_KEY; 
    
    if (!storedAdminKey) {
      console.error('❌ Admin login failed: ADMIN_KEY environment variable not set.');
      return res.status(500).json({ error: 'Server authentication key not configured' });
    }

    if (adminKey === storedAdminKey) {
      if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT secret not configured' });
      
      const token = jwt.sign(
        { id: 'admin', role: 'admin', name: 'Admin User', type: 'admin-key-auth' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ success: true, token, user: { id: 'admin', name: 'Admin User', role: 'admin' } });
    }
    
    res.status(401).json({ error: 'Invalid admin key' });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
});


// --- 7. Frontend Static Serving & SPA Fallback ---
const publicPath = path.join(__dirname, 'dist'); // Assuming 'dist' is the frontend build folder

// Serve static frontend files
app.use(express.static(publicPath));
console.log(`📦 Serving static files from: ${publicPath}`);


// SPA Fallback: sends index.html for all non-API and non-static routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  
  const indexFile = path.join(publicPath, 'index.html');

  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  
  res.status(404).send('Frontend index.html not found. Check your build configuration.');
});


// --- 8. Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  
  // Handle specific Mongoose errors
  if (err.name === 'ValidationError') return res.status(400).json({ error: 'Validation Error', details: Object.values(err.errors).map(e => e.message) });
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID format' });
  if (err.code === 11000) return res.status(409).json({ error: `${Object.keys(err.keyPattern)[0]} already exists` });
  
  // Handle JWT errors
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid or missing token.' });
  }

  // Generic Error Response
  const statusCode = err.status || 500;
  res.status(statusCode).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    details: isProduction ? undefined : err.stack
  });
});

// --- 9. Server Start ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 HALT Shelter API server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = app;
