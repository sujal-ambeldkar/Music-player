const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  await user.save();
  res.send({ message: 'User registered' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).send({ error: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send({ error: 'Wrong password' });
  const token = jwt.sign({ id: user._id }, SECRET);
  res.send({ token });
});

module.exports = router;
