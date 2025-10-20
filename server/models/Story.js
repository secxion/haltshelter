const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Story excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Story content is required']
  },
  contentMarkdown: {
    type: String // Store original markdown if needed
  },
  category: {
    type: String,
    required: [true, 'Story category is required'],
    enum: ['Success Story', 'Recent Rescue', 'Medical Success', 'Volunteer Spotlight', 'Foster Story', 'Memorial', 'News', 'Event']
  },
  featuredImage: {
    url: {
      type: String,
      required: [true, 'Featured image is required']
    },
    altText: String,
    caption: String
  },
  additionalImages: [{
    url: String,
    altText: String,
    caption: String
  }],
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  },
  animalName: String, // For stories where animal might be adopted/not in system
  author: {
    name: {
      type: String,
      default: 'HALT Shelter Team'
    },
    email: String,
    role: String
  },
  tags: [String], // e.g., ['heartwarming', 'medical-miracle', 'senior-dog']
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  seoTitle: String,
  seoDescription: String,
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  socialShares: {
    facebook: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    instagram: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create slug from title before saving
storySchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
  
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for searching and performance
storySchema.index({ title: 'text', excerpt: 'text', content: 'text' });
storySchema.index({ category: 1, isPublished: 1, publishedAt: -1 });
storySchema.index({ isFeatured: 1, isPublished: 1 });

module.exports = mongoose.model('Story', storySchema);
