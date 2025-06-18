export class ValidationError extends Error {
  constructor(
    message: string,
    readonly errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
