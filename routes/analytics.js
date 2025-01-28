import express from "express";
import { aliasAnalytics, topicAnalysis, overallAnalysis } from "../Controllers/analytics.js";
import { isAuthenticated } from "../middleware/auth.js";
import { rateLimiting } from "../middleware/limiter.js";

const analyticsRouter = express.Router();

// Ensure that all routes use valid paths
analyticsRouter.get("/topic/:topic", isAuthenticated,  rateLimiting, topicAnalysis);
analyticsRouter.get("/overall", isAuthenticated,  rateLimiting, overallAnalysis);
analyticsRouter.get("/:alias", isAuthenticated,  rateLimiting, aliasAnalytics);

export default analyticsRouter;
