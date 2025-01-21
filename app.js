import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from 'dotenv'
import router from "./routes/auth.js";
import UrlRouter from "./routes/url.js";

export const app = express();

// Express session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key", // Use a strong secret
    resave: false, // Avoid saving sessions that have not been modified
    saveUninitialized: false, // Do not save uninitialized sessions
    cookie: { secure: false }, // Set to `true` if using HTTPS
  })
);
app.use(express.json())
// Initialize Passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session()); // This enables persistent login sessions

dotenv.config();
//console.log(process.env.GOOGLE_CLIENT_ID)
app.use("/api/auth",router)
app.use("/api",UrlRouter)