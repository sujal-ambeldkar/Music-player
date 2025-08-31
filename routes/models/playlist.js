const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  songs: [String]
});

module.exports = mongoose.model('Playlist', playlistSchema);
