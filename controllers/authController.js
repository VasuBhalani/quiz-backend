import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

//Generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // New user – mock registration
      user = new User({
        uuid: uuidv4().split('-')[0], 
        email,
        password // Stored but NOT validated
      });

      await user.save();
    }

    const token = generateToken({ uuid: user.uuid, email: user.email });

    return res.status(200).json({
      message: user.isNew ? 'Registered successfully' : 'Login successful',
      token,
      uuid: user.uuid
    });
  } catch (err) {
    console.error('Login/Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const logout = (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
};
