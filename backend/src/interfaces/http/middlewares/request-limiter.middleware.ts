import slowDown from 'express-slow-down';

/**
 * Speed limiter to limit the number of requests per window
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The next function
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per 15 minutes, then...
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  }, // Begin adding 500ms of delay per request above 100
  // Skip for development
  skip: () => process.env.NODE_ENV === 'development',
});

/**
 * Payload limiter to limit the size of the request payload
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The next function
 */
export const payloadLimiter = require('express').json({
  limit: '10kb',
});
