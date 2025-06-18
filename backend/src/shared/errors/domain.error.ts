import { ApplicationError } from './application.error';

export class DomainError extends ApplicationError {
  constructor(message: string, details?: any) {
    super('DOMAIN_ERROR', message, 400, details);
    this.name = 'DomainError';
  }
}
