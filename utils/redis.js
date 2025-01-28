import Redis from 'ioredis';

// Retrieve Redis config from environment variables for flexibility
const redis = new Redis();

const disconnectRedis = async () => {
  try {
    await redis.disconnect();
  } catch (err) {
    console.error('Error disconnecting from Redis:', err);
  }
};

export { redis, disconnectRedis };
