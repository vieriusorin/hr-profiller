import { Request } from 'express';

export interface DecodedToken {
  // NextAuth standard fields
  name?: string;
  email?: string;
  picture?: string;
  sub?: string; // Subject (user ID)
  
  // Custom fields from our enhanced auth
  id?: string;
  role?: string;
  provider?: string;
  
  // JWT standard fields
  iat?: number; // Issued at
  exp?: number; // Expires at
  nbf?: number; // Not before
  jti?: string; // JWT ID
  iss?: string; // Issuer
  aud?: string | string[]; // Audience
  
  // Additional NextAuth fields
  sessionToken?: string;
  
  // Any other dynamic fields
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
} 