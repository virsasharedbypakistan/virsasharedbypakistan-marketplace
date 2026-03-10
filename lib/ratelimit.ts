import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Auth routes: 5 req / 15 min per IP
export const authLoginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '15 m'),
  prefix: 'rl:auth:login',
});

// Auth register: 3 req / 1 hour per IP
export const authRegisterRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '1 h'),
  prefix: 'rl:auth:register',
});

// Auth reset: 3 req / 1 hour per IP
export const authResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '1 h'),
  prefix: 'rl:auth:reset',
});

// Mutation routes (POST/PUT/PATCH/DELETE): 60 req / 1 min per user
export const mutationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(60, '1 m'),
  prefix: 'rl:mutation',
});

// Read routes (GET): 300 req / 1 min per IP
export const readRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(300, '1 m'),
  prefix: 'rl:read',
});

// Order creation: 10 req / 1 min per user
export const orderRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, '1 m'),
  prefix: 'rl:order',
});
