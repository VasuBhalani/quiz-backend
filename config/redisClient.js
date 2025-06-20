// utils/redisClient.js
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();
// console.log(process.env.REDIS_URL);
const redis = new Redis(process.env.REDIS_URL, {
  connectTimeout: 10000,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
});

redis.on('connect', () => {
  console.log('Connected to Redis Cloud');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
