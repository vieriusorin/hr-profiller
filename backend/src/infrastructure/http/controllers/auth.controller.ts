import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as schema from '../../../../db/schema';
import { inject, injectable } from 'inversify';
import { DatabaseType, TYPES } from '../../../shared/types';
import { JWTTokenService, TokenGenerationOptions } from '../../../domain/auth/services/jwt-token.service';

@injectable()
export class AuthController {
  private readonly jwtTokenService: JWTTokenService;

  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) {
    this.jwtTokenService = new JWTTokenService();
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password, clientId, expiresIn } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
      return;
    }

    try {
      // 1. Find user in our database
      const user = await this.db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });

      if (!user || !user.passwordHash) {
        res.status(401).json({ 
          success: false,
          error: 'Invalid credentials' 
        });
        return;
      }

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({ 
          success: false,
          error: 'Invalid credentials' 
        });
        return;
      }

      // 3. Get user's role
      const userRoleRelation = await this.db.query.userRoles.findFirst({
        where: eq(schema.userRoles.userId, user.id),
        with: {
          role: true,
        },
      });

      const roleName = userRoleRelation?.role?.name || 'employee';

      // 4. Generate technical token for user session
      const tokenOptions: TokenGenerationOptions = {
        clientId: clientId || 'user-session',
        expiresIn: expiresIn || '24h',
        scope: ['api:read', 'api:write'] // Users get full API access
      };

      const token = this.jwtTokenService.generateTechnicalToken({
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: roleName
      }, tokenOptions);

      // 5. Get token expiration info
      const tokenExpiration = this.jwtTokenService.getTokenExpiration(token);
      const tokenStats = this.jwtTokenService.getTokenStats(token);

      // 6. Return unified response format
      res.status(200).json({
        success: true,
        data: {
          token,
          tokenType: 'Bearer',
          expiresAt: tokenExpiration?.toISOString(),
          expiresIn: tokenStats?.expiresIn || 0,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: roleName,
            isActive: user.isActive,
          },
          tokenInfo: {
            clientId: tokenOptions.clientId,
            scope: tokenStats?.scope,
            permissions: tokenStats?.permissions,
            type: 'user-session',
            grantType: 'password'
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }

  async generateTechnicalToken(req: Request, res: Response): Promise<void> {
    const { client_id, client_secret, clientId, expiresIn, scope } = req.body;

    // Validate required fields
    if (!client_id || !client_secret) {
      res.status(400).json({ 
        success: false,
        error: 'client_id and client_secret are required' 
      });
      return;
    }

    try {
      // 1. Validate client credentials against environment variables
      const validClientId = process.env.CLIENT_ID;
      const validClientSecret = process.env.CLIENT_SECRET;

      if (!validClientId || !validClientSecret) {
        res.status(500).json({ 
          success: false,
          error: 'Server configuration error: client credentials not configured' 
        });
        return;
      }

      if (client_id !== validClientId || client_secret !== validClientSecret) {
        res.status(401).json({ 
          success: false,
          error: 'Invalid client credentials' 
        });
        return;
      }

      // 2. Generate JWT technical token with service-level permissions
      const tokenOptions: TokenGenerationOptions = {
        clientId: clientId || client_id,
        expiresIn: expiresIn || '24h',
        scope: scope ? scope.split(' ') : ['api:read', 'api:write']
      };

      // Create a service identity (no user context)
      const serviceIdentity = {
        id: 'service',
        email: `${client_id}@system`,
        name: `Service: ${client_id}`,
        role: 'service'
      };

      const token = this.jwtTokenService.generateTechnicalToken(serviceIdentity, tokenOptions);

      // 3. Get token expiration info
      const tokenExpiration = this.jwtTokenService.getTokenExpiration(token);
      const tokenStats = this.jwtTokenService.getTokenStats(token);

      // 4. Return token info (service-to-service authentication)
      res.status(200).json({
        success: true,
        data: {
          token,
          tokenType: 'Bearer',
          expiresAt: tokenExpiration?.toISOString(),
          expiresIn: tokenStats?.expiresIn || 0,
          tokenInfo: {
            clientId: tokenOptions.clientId,
            scope: tokenStats?.scope,
            permissions: tokenStats?.permissions,
            type: 'technical',
            grantType: 'client_credentials'
          }
        }
      });

    } catch (error) {
      console.error('Technical token generation error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Token is required'
      });
      return;
    }

    try {
      const validation = this.jwtTokenService.validateToken(token);
      const tokenStats = validation.valid ? this.jwtTokenService.getTokenStats(token) : null;

      res.status(200).json({
        success: true,
        data: {
          valid: validation.valid,
          error: validation.error,
          payload: validation.payload,
          expiresIn: validation.expiresIn,
          stats: tokenStats
        }
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { token, expiresIn, clientId } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Token is required'
      });
      return;
    }

    try {
      const newToken = this.jwtTokenService.refreshToken(token, {
        expiresIn: expiresIn || '24h',
        clientId
      });

      if (!newToken) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
        return;
      }

      const tokenExpiration = this.jwtTokenService.getTokenExpiration(newToken);
      const tokenStats = this.jwtTokenService.getTokenStats(newToken);

      res.status(200).json({
        success: true,
        data: {
          token: newToken,
          tokenType: 'Bearer',
          expiresAt: tokenExpiration?.toISOString(),
          expiresIn: tokenStats?.expiresIn || 0,
          tokenInfo: {
            clientId: tokenStats?.clientId,
            scope: tokenStats?.scope,
            permissions: tokenStats?.permissions
          }
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async revokeToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Token is required'
      });
      return;
    }

    try {
      const revoked = this.jwtTokenService.revokeToken(token);

      if (revoked) {
        res.status(200).json({
          success: true,
          message: 'Token revoked successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid token or token already revoked'
        });
      }
    } catch (error) {
      console.error('Token revocation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 