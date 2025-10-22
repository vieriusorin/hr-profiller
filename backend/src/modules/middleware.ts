import express from 'express';
import { validationResult } from 'express-validator';

/**
 * @description Middleware to handle input validation errors.
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 * @returns 
 */
export const handleInputError = (
  err: Error & { type?: string },
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};
