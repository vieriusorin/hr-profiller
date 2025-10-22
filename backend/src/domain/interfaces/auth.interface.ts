import { Request } from 'express';

/**
 * @description Decoded JWT token structure used in authentication.
 * Combines standard JWT fields with custom application-specific fields.
 * @interface DecodedToken
 * @property {string} [name] - The name of the user.
 * @property {string} [email] - The email of the user.
 * @property {string} [picture] - The profile picture URL of the user.
 * @property {string} [sub] - The subject (user ID) of the token.
 * @property {string} [id] - Custom user ID field.
 * @property {string} [role] - Custom user role field.
 * @property {string} [provider] - Custom authentication provider field.
 * @property {number} [iat] - Issued at timestamp.
 * @property {number} [exp] - Expiration timestamp.
 * @property {number} [nbf] - Not before timestamp.
 * @property {string} [jti] - JWT ID.
 * @property {string} [iss] - Issuer of the token.
 * @property {string|string[]} [aud] - Audience of the token.
 * @property {string} [sessionToken] - NextAuth session token.
 * @property {any} [key: string] - Additional dynamic fields.
 */
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

export interface TechnicalClient {
  id: string;
  name: string;
  permissions: Permission[];
  rateLimits: {
    requests: number;
    windowMs: number;
  };
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface ITechnicalAuthService {
  validateToken(token: string): Promise<TechnicalClient | null>;
  getTechnicalClient(clientId: string): Promise<TechnicalClient | null>;
  getAllClients(): Promise<TechnicalClient[]>;
  hasPermission(client: TechnicalClient, resource: string, action: string): boolean;
  updateLastUsed(clientId: string): Promise<void>;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
  technicalClient?: TechnicalClient;
} 