import { sendCookie } from '../utils/cookie.js';
import passport from "../utils/passport_config.js"


import { User } from '../model/user.js';



export const loginUser = async (req,res) => {
  try {
    const { sub, email } = req.body;

    // Checking if the user is registered
    const userExists = await User.findOne({ googleId: sub });
    if (userExists) {
      // Generating JWT token for further requests
      sendCookie(userExists, res, `Welcome back,`, 200);
      
    } else {
      // If the user account is not registered, throwing a 404 error
      const error = new Error(
        "User doesn't exist. Please create an account to create short URLs."
      );
      console.error(error);
    return res.status(500).json({ message: 'Server error' });
    }
  } catch (err) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const registerUser = async (req,res) => {
  try {
    const { sub, name, email } = req.body;

    // Checking if a user with the same Google ID already exists
    const existingUser = await User.findOne({ googleId: sub });
    if (existingUser) {
      const error = new Error(
        "Account already exists. Please log in to create URLs and view analytics."
      );
      console.error(error);
    return res.status(500).json({ message: 'Server error' });
    }

    // Registering the user
    const newUser = new User({
      googleId: sub,
      name: name,
      email: email,
    });
    const savedUser = await newUser.save();

    if (savedUser) {
      sendCookie(savedUser, res, `Welcome back,`, 200);
    }
  } catch (err) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


