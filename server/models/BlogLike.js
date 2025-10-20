const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  ipHash: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // index is created below as a TTL index with partialFilterExpression;
    // avoid declaring `index: true` here to prevent duplicate-index warnings
    // from Mongoose when the schema.index() call below defines the same key
    // with different options.
  }
});

// Unique constraint: a user can like a blog only once. Use partialFilterExpression
// so documents without userId are not indexed (avoids null-value collisions).
// Index only documents where userId is an ObjectId (avoids indexing null or other
// non-object types). Using $type is broadly supported and avoids $ne/$not
// expressions which some MongoDB servers reject for partial indexes.
blogLikeSchema.index(
  { blogId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } }
);
// For anonymous likes we keep a unique constraint per ipHash and only index docs with ipHash
// For anonymous likes index only when ipHash is a string
blogLikeSchema.index(
  { blogId: 1, ipHash: 1 },
  { unique: true, partialFilterExpression: { ipHash: { $type: 'string' } } }
);

// TTL index for anonymous (ipHash) likes only. Default: 90 days
const ttlSeconds = Number(process.env.BLOGLIKE_TTL_SECONDS) || (90 * 24 * 60 * 60);
blogLikeSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: ttlSeconds, partialFilterExpression: { ipHash: { $type: 'string' } } }
);

module.exports = mongoose.model('BlogLike', blogLikeSchema);
