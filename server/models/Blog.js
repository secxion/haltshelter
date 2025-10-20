const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    trim: true,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: [
      'pet-care',
      'adoption-tips', 
      'animal-health',
      'success-stories',
      'shelter-updates',
      'volunteer-spotlights',
      'fundraising-events',
      'community-outreach',
      'educational',
      'announcements'
    ]
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  
  author: {
    name: {
      type: String,
      required: [true, 'Author name is required']
    },
    email: String,
    bio: String,
    avatar: String
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  
  publishedAt: {
    type: Date,
    default: null
  },
  
  scheduledFor: {
    type: Date,
    default: null
  },
  
  metaData: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  // Related content
  relatedAnimals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  }],
  
  relatedStories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  
  // Comments (if enabled)
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  
  comments: [{
    author: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      author: {
        name: String,
        email: String,
        isAdmin: {
          type: Boolean,
          default: false
        }
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  // Featured settings
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  featuredOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g 
    });
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Ensure unique slug
blogSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    let baseSlug = this.slug;
    let counter = 1;
    
    while (true) {
      const existingBlog = await mongoose.model('Blog').findOne({ 
        slug: this.slug, 
        _id: { $ne: this._id } 
      });
      
      if (!existingBlog) break;
      
      this.slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  next();
});

// Virtual for formatted publish date
blogSchema.virtual('formattedPublishDate').get(function() {
  if (this.publishedAt) {
    return this.publishedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return null;
});

// Virtual for reading time estimate
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.status === 'approved').length;
});

// Indexes for performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1, featuredOrder: 1 });
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Ensure virtuals are included in JSON
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
