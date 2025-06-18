import { ApplicationError } from './application.error';

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}
