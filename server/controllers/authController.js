const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isText = (value) => typeof value === 'string' && value.trim() !== '';

async function register(req, res) {
  const { name, email, password } = req.body || {};

  if (!isText(name) || !isText(email) || !isText(password)) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (await User.findOne({ email: email.toLowerCase().trim() })) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  res.status(201).json({
    message: 'Registration successful',
    user: { id: user._id, name: user.name, email: user.email },
  });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!isText(email) || !isText(password)) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
}

module.exports = { register, login };
