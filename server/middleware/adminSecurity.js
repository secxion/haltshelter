/**
 * Admin Security Middleware
 * Protects admin routes with additional security measures
 */

const rateLimit = require('express-rate-limit');

// Allowed origins for admin panel
const ADMIN_ALLOWED_ORIGINS = [
  'http://localhost:3002',           // Local development
  'https://halt-admin.onrender.com', // Production admin panel (update this!)
  'https://admin.haltshelter.org',   // Custom admin domain if you set one up
  process.env.ADMIN_PANEL_URL        // Environment variable override
].filter(Boolean);

// Rate limiter for admin login attempts
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + email combo for more precise limiting
  keyGenerator: (req) => {
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  }
});

// Rate limiter for general admin API calls
const adminApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to check admin origin
const checkAdminOrigin = (req, res, next) => {
  const origin = req.get('origin') || req.get('referer');
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In development, be more permissive
  if (!isProduction) {
    return next();
  }
  
  // In production, check origin
  if (!origin) {
    console.warn(`[ADMIN SECURITY] Request without origin to ${req.path} from IP: ${req.ip}`);
    // Allow requests without origin (like from server-side or Postman) but log them
    return next();
  }
  
  const isAllowedOrigin = ADMIN_ALLOWED_ORIGINS.some(allowed => 
    origin.startsWith(allowed)
  );
  
  if (!isAllowedOrigin) {
    console.error(`[ADMIN SECURITY] BLOCKED request from unauthorized origin: ${origin} to ${req.path}`);
    return res.status(403).json({
      error: 'Access denied. Unauthorized origin.',
      code: 'INVALID_ORIGIN'
    });
  }
  
  next();
};

// Middleware to log admin actions
const logAdminAction = (action) => {
  return (req, res, next) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      user: req.user?.email || req.user?._id || 'unknown',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path,
      method: req.method,
      body: req.method !== 'GET' ? sanitizeLogBody(req.body) : undefined
    };
    
    console.log(`[ADMIN ACTION] ${JSON.stringify(logEntry)}`);
    
    // Store in response locals for potential DB logging
    res.locals.adminAction = logEntry;
    
    next();
  };
};

// Sanitize sensitive data from logs
const sanitizeLogBody = (body) => {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
};

// Middleware to validate admin session is still valid
const validateAdminSession = async (req, res, next) => {
  // Check if user still exists and is still admin
  if (req.user && req.user._id !== 'admin-user') {
    const { User } = require('../models');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    
    if (user.role !== 'admin' && user.role !== 'staff') {
      return res.status(403).json({ error: 'Admin privileges revoked.' });
    }
    
    // Check if user is disabled/banned
    if (user.isDisabled) {
      return res.status(403).json({ error: 'Account has been disabled.' });
    }
  }
  
  next();
};

// Export all security middleware
module.exports = {
  adminLoginLimiter,
  adminApiLimiter,
  checkAdminOrigin,
  logAdminAction,
  validateAdminSession,
  ADMIN_ALLOWED_ORIGINS
};
