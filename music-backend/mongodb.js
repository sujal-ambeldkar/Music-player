// mongodb.js
const mongoose = require("mongoose");
require("dotenv").config();

// ---------------------
// Avoid strict query warnings
// ---------------------
mongoose.set("strictQuery", false);

// ---------------------
// MongoDB Atlas Connection
// ---------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ---------------------
// Login Schema (authentication)
// ---------------------
const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

// ---------------------
// User Schema (saved songs)
// ---------------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  savedSongs: [
    {
      title: { type: String, required: true },
      artist: { type: String },
      movie: { type: String },
      album: { type: String },
      url: { type: String },
      thumbnail: { type: String },
      coverUrl: { type: String },
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

// ---------------------
// Upload Schema (uploaded songs) - ENHANCED
// ---------------------
const uploadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, default: 'Unknown' },
  album: { type: String, default: 'Unknown' },
  url: { type: String, required: true },
  coverUrl: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  duration: Number,
  playCount: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
uploadSchema.index({ uploadedBy: 1 });
uploadSchema.index({ uploadedAt: -1 });
uploadSchema.index({ playCount: -1 });

// ---------------------
// Models
// ---------------------
const LoginUser = mongoose.model("LoginUser", loginSchema);
const User = mongoose.model("User", userSchema);
const Upload = mongoose.model("Upload", uploadSchema);

// ---------------------
// Export all models
// ---------------------
module.exports = { LoginUser, User, Upload };
