import express from 'express';
import { validationResult } from 'express-validator';

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
