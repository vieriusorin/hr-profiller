export interface ResponseEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  code: string;
  stack?: string;
}
