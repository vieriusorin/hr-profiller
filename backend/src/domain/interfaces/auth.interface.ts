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