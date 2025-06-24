import { Request } from 'express';

export interface DecodedToken {
  name?: string;
  email?: string;
  picture?: string;
  role?: string; 
  iat: number;
  exp: number;
  jti: string;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
} 