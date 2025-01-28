import { redis } from "./redis.js";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
	storeClient: redis,
	points: 5,
	duration: 15 * 60,
	blockDuration: 60 * 5,
});
export default rateLimiter;