import { ApplicationError } from './application.error';

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}
