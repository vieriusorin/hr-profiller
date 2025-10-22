import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * TechnicalTokenPayload defines the structure of the JWT payload for technical tokens.
 * These tokens are used for service-to-service authentication and API access.
 * They include user identity, role, permissions, and token metadata.
 */
export interface TechnicalTokenPayload {
  // Standard JWT fields
  iat: number;
  exp: number;
  iss: string;
  
  // User identity
  userId: string;
  email: string;
  name: string;
  
  // Authorization
  role: string;
  permissions: string[];
  
  // Technical token specifics
  tokenType: 'technical';
  clientId?: string;
  scope?: string;
  
  // Security
  jti: string; // JWT ID for revocation
}

/**
 * Options for generating JWT tokens
 */
export interface TokenGenerationOptions {
  clientId?: string;
  expiresIn?: string; // e.g., '1h', '24h', '7d'
  scope?: string[];
  permissions?: string[];
}

/**
 * Result of token validation
 * Contains the validation status, decoded payload, and any error messages.
 * @param valid - Indicates if the token is valid
 * @param payload - Decoded token payload if valid
 * @param error - Error message if invalid
 * @param expiresIn - Time in seconds until token expiration
 */
export interface TokenValidationResult {
  valid: boolean;
  payload?: TechnicalTokenPayload;
  error?: string;
  expiresIn?: number; // seconds remaining
}

/**
 * JWTTokenService handles generation, validation, refreshing, and revocation of JWT tokens.
 * It uses HS256 algorithm and a secret key defined in NEXTAUTH_SECRET environment variable.
 * Technical tokens are designed for service-to-service authentication with specific roles and permissions.
 */
@injectable()
export class JWTTokenService {
  private readonly issuer = 'hr-profiler-api';
  private readonly defaultExpiration = '24h';
  private readonly revokedTokens = new Set<string>(); // In-memory revocation list

  constructor() {
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET environment variable is required for JWT operations');
    }
  }

  /**
   * Generate a technical JWT token for API access
   */
  generateTechnicalToken(
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    },
    options: TokenGenerationOptions = {}
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const jwtId = crypto.randomUUID();
    
    const payload: TechnicalTokenPayload = {
      // Standard JWT fields
      iat: now,
      exp: now + this.parseExpiration(options.expiresIn || this.defaultExpiration),
      iss: this.issuer,
      
      // User identity
      userId: user.id,
      email: user.email,
      name: user.name,
      
      // Authorization
      role: user.role,
      permissions: options.permissions || this.getDefaultPermissions(user.role),
      
      // Technical token specifics
      tokenType: 'technical',
      clientId: options.clientId || 'default',
      scope: options.scope?.join(' ') || 'api:read api:write',
      
      // Security
      jti: jwtId
    };

    return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
      algorithm: 'HS256'
    });
  }

  /**
   * Validate and decode a JWT token
   * Returns TokenValidationResult with validity status and payload or error message.
   */
  validateToken(token: string): TokenValidationResult {
    try {
      // Check if token is revoked
      const decoded = jwt.decode(token) as TechnicalTokenPayload;
      if (decoded?.jti && this.revokedTokens.has(decoded.jti)) {
        return {
          valid: false,
          error: 'Token has been revoked'
        };
      }

      // Verify token signature and expiration
      const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as TechnicalTokenPayload;
      
      // Validate token type
      if (payload.tokenType !== 'technical') {
        return {
          valid: false,
          error: 'Invalid token type'
        };
      }

      // Calculate remaining time
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;

      return {
        valid: true,
        payload,
        expiresIn: Math.max(0, expiresIn)
      };
    } catch (error) {
      let errorMessage = 'Invalid token';
      
      if (error instanceof jwt.TokenExpiredError) {
        errorMessage = 'Token has expired';
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = 'Invalid token signature';
      }

      return {
        valid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Refresh a token (generate new token with extended expiration)
   * Returns new token string or null if original token is invalid.
   */
  refreshToken(token: string, options: TokenGenerationOptions = {}): string | null {
    const validation = this.validateToken(token);
    
    if (!validation.valid || !validation.payload) {
      return null;
    }

    // Create new token with same user data but extended expiration
    const user = {
      id: validation.payload.userId,
      email: validation.payload.email,
      name: validation.payload.name,
      role: validation.payload.role
    };

    // Revoke the old token
    this.revokeToken(token);

    // Generate new token
    return this.generateTechnicalToken(user, {
      ...options,
      clientId: validation.payload.clientId,
      permissions: validation.payload.permissions
    });
  }

  /**
   * Revoke a token (add to revocation list)
   * Returns true if successfully revoked, false otherwise.
   */
  revokeToken(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as TechnicalTokenPayload;
      if (decoded?.jti) {
        this.revokedTokens.add(decoded.jti);
        
        // Clean up expired revoked tokens periodically
        this.cleanupRevokedTokens();
        
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error revoking token:', error);
      return false;
    }
  }

  /**
   * Get token expiration timestamp
   * Returns Date object or null if unable to decode.
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as TechnicalTokenPayload;
      return decoded?.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      console.log('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Parse expiration string to seconds
   * E.g., '1h' -> 3600, '24h' -> 86400
   */
  private parseExpiration(expiresIn: string): number {
    const units: Record<string, number> = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400,
      'w': 604800
    };

    const match = expiresIn.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error(`Invalid expiration format: ${expiresIn}`);
    }

    const [, value, unit] = match;
    return parseInt(value, 10) * units[unit];
  }

  /**
   * Get default permissions based on user role
   * Returns array of permission strings.
   */
  private getDefaultPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'admin': [
        'read:*',
        'write:*', 
        'delete:*',
        'admin:users',
        'admin:system',
        'admin:hr'
      ],
      'hr_manager': [
        'read:users',
        'read:employees', 
        'write:employees',
        'delete:employees',
        'read:persons',
        'write:persons',
        'read:opportunities',
        'write:opportunities',
        'read:roles',
        'write:roles',
        'read:reports',
        'write:reports',
        'read:lookup',
        'admin:hr'
      ],
      'recruiter': [
        'read:persons',
        'write:persons',
        'read:opportunities',
        'write:opportunities',
        'delete:opportunities',
        'read:roles',
        'write:roles',
        'read:lookup',
        'read:employees'
      ],
      'employee': [
        'read:profile',
        'write:profile',
        'read:lookup'
      ],
      'service': [
        'read:employees',
        'write:employees',
        'read:persons',
        'write:persons',
        'read:opportunities',
        'write:opportunities',
        'read:roles',
        'write:roles',
        'read:lookup',
        'read:*',
        'write:*'
      ]
    };

    return rolePermissions[role] || rolePermissions['employee'];
  }

  /**
   * Clean up expired revoked tokens from memory
   */
  private cleanupRevokedTokens(): void {
    // This is a simplified cleanup - in production, you'd want to persist
    // revoked tokens to database and clean them up properly
    if (this.revokedTokens.size > 10000) {
      console.warn('Revoked tokens set is getting large. Consider implementing database-backed revocation.');
    }
  }

  /**
   * Get token statistics (for monitoring/debugging)
   * Returns an object with token stats or null if unable to decode.
   */
  getTokenStats(token: string): Record<string, any> | null {
    try {
      const decoded = jwt.decode(token) as TechnicalTokenPayload;
      if (!decoded) return null;

      const now = Math.floor(Date.now() / 1000);
      
      return {
        issued: new Date(decoded.iat * 1000).toISOString(),
        expires: new Date(decoded.exp * 1000).toISOString(),
        expiresIn: Math.max(0, decoded.exp - now),
        age: now - decoded.iat,
        clientId: decoded.clientId,
        role: decoded.role,
        permissions: decoded.permissions,
        scope: decoded.scope
      };
    } catch (error) {
      console.log('Error getting token stats:', error);
      return null;
    }
  }
}