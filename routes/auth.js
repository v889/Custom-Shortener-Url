
import express from "express";
import passport from "passport";
const router=express.Router();
import { googleAuth,googleCallback } from "../Controllers/auth.js";
router.get('/google', googleAuth);

// Google Callback Route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleCallback
);

export default router;