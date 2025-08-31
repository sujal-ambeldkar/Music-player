const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).send({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).send({ error: 'Invalid token' });
  }
}

router.post('/create', verifyToken, async (req, res) => {
  const { name, songs } = req.body;
  const playlist = new Playlist({ userId: req.userId, name, songs });
  await playlist.save();
  await User.findByIdAndUpdate(req.userId, { $push: { playlists: playlist._id } });
  res.send({ message: 'Playlist created' });
});

router.get('/mine', verifyToken, async (req, res) => {
  const playlists = await Playlist.find({ userId: req.userId });
  res.send(playlists);
});

module.exports = router;
