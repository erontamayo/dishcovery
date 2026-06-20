import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db/connection.js';

const router = express.Router();
const resetTokens = new Map();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    await query('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)', 
      [email, passwordHash, name, 'student']);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const users = await query('SELECT id, password_hash, name, role FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = email;
    req.session.name = user.name;
    req.session.role = user.role;

    res.json({ 
      message: 'Login successful',
      user: { id: user.id, name: user.name, email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 🔥 FIX: correct destructuring
    const [rows] = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.json({
        message: 'If account exists, reset link sent',
      });
    }

    const user = rows[0];

    console.log('🔥 USER FOUND:', user);

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 15;

    // 🔥 FIX: correct update handling
    const [result] = await query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [token, expires, user.id]
    );

    console.log('🔥 UPDATE RESULT:', result);

    if (!result || result.affectedRows === 0) {
      return res.status(500).json({
        error: 'Failed to store reset token',
      });
    }

    return res.json({
      resetToken: token,
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// RESET PASSWORD 
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Token and password are required',
      });
    }

    console.log('🔥 TOKEN RECEIVED:', token);

    // 🔥 CLEAN QUERY (your connection.js already returns rows)
    const rows = await query(
      'SELECT id, reset_expires FROM users WHERE reset_token = ?',
      [token]
    );

    console.log('🔥 DB RESULT:', rows);

    // SAFE CHECK
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid token',
      });
    }

    const user = rows[0];

    if (!user?.id) {
      return res.status(400).json({
        error: 'Invalid token data',
      });
    }

    if (Date.now() > user.reset_expires) {
      return res.status(400).json({
        error: 'Token expired',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const update = await query(
      `UPDATE users 
       SET password_hash = ?, reset_token = NULL, reset_expires = NULL 
       WHERE id = ?`,
      [passwordHash, user.id]
    );

    console.log('🔥 UPDATE RESULT:', update);

    return res.json({
      message: 'Password reset successful',
    });

  } catch (error) {
    console.error('🔥 RESET ERROR:', error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
});


// Logout user
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/user', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: req.session.userId,
    name: req.session.name,
    email: req.session.email,
    role: req.session.role
  });
});

export default router;