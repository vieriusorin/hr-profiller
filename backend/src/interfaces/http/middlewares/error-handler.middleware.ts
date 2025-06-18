import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../shared/errors/domain.error';
import { ApplicationError } from '../../../shared/errors/application.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';

/**
 * Error handler middleware to handle errors
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The next function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.details,
    });
  }

  if (err instanceof DomainError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.details,
    });
  }

  if (err instanceof ApplicationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
