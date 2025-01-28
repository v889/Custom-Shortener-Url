
import express from "express";
import { redirectUrl,createUrl } from "../Controllers/url.js";
const UrlRouter=express.Router();
import { isAuthenticated } from "../middleware/auth.js";
import { rateLimiting } from "../middleware/limiter.js";


UrlRouter.post('/shorten',isAuthenticated,rateLimiting,createUrl)
UrlRouter.get('/shorten/:alias',isAuthenticated,redirectUrl)

export default UrlRouter;