import mongoose from 'mongoose';

const shortUrlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    unique: true,
    required: true,
  },
  topic: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);
export default ShortUrl;