import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from 'dotenv'
import router from "./routes/auth.js";
import UrlRouter from "./routes/url.js";
import analyticsRouter from "./routes/analytics.js";
import cookieParser from "cookie-parser";

export const app = express();
app.use(cookieParser())
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

app.use(passport.initialize());
app.use(passport.session()); 

dotenv.config();
app.use("/api/auth",router)
app.use("/api",UrlRouter)
app.use("/api/analytics",analyticsRouter)