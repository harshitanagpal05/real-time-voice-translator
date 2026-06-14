import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    return res.json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}
