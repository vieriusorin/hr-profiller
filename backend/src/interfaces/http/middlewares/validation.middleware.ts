import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware to validate the request
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The next function
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      data: {
        message: 'Validation failed',
        errors: errors.array(),
        code: 'VALIDATION_ERROR',
      },
    });
  }
  next();
};
