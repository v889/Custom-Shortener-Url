import passport from '../utils/passport_config.js'
import jwt from 'jsonwebtoken';
import { sendCookie } from '../utils/cookie.js';

// Google Auth Handler
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Google Callback Handler
export const googleCallback = (req, res) => {
  try {
    sendCookie(req.user, res, `Welcome back,`, 200);

  res.status(200).json({message:'login sucessfully'})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

