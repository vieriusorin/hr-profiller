import { injectable } from 'inversify';
import { ITechnicalAuthService, TechnicalClient, Permission } from '../../interfaces/auth.interface';
import crypto from 'crypto';

@injectable()
export class TechnicalAuthService implements ITechnicalAuthService {
  private technicalClients: Map<string, TechnicalClient> = new Map();
  private tokenToClientMap: Map<string, string> = new Map();

  constructor() {
    this.initializeTechnicalClients();
  }

  private initializeTechnicalClients(): void {
    // Load technical clients from environment variable
    const technicalTokensEnv = process.env.TECHNICAL_TOKENS;
    
    if (!technicalTokensEnv) {
      console.info('TECHNICAL_TOKENS environment variable not found. Technical authentication disabled (this is optional).');
      return;
    }

    try {
      const tokensConfig = JSON.parse(technicalTokensEnv);
      
      Object.entries(tokensConfig).forEach(([clientId, token]) => {
        const client = this.createTechnicalClient(clientId, token as string);
        this.technicalClients.set(clientId, client);
        this.tokenToClientMap.set(token as string, clientId);
      });

      console.log(`✅ Initialized ${this.technicalClients.size} technical clients`);
    } catch (error) {
      console.warn('Warning: Error parsing TECHNICAL_TOKENS (technical auth will be disabled):', error instanceof Error ? error.message : String(error));
    }
  }

  private createTechnicalClient(clientId: string, token: string): TechnicalClient {
    const permissions = this.getDefaultPermissions(clientId);
    const rateLimits = this.getDefaultRateLimits(clientId);

    return {
      id: clientId,
      name: this.getClientDisplayName(clientId),
      permissions,
      rateLimits,
      isActive: true,
      createdAt: new Date(),
    };
  }

  private getDefaultPermissions(clientId: string): Permission[] {
    const permissionMap: Record<string, Permission[]> = {
      'frontend': [
        { resource: 'api', action: 'read' },
        { resource: 'api', action: 'write' },
        { resource: 'health', action: 'read' }
      ],
      'mcp-server': [
        { resource: 'api/mcp', action: 'read' },
        { resource: 'api/mcp', action: 'write' },
        { resource: 'api/ai', action: 'read' },
        { resource: 'api/ai', action: 'write' },
        { resource: 'health', action: 'read' }
      ],
      'admin-scripts': [
        { resource: 'api/admin', action: 'read' },
        { resource: 'api/admin', action: 'write' },
        { resource: 'api/bulk-operations', action: 'write' },
        { resource: 'health', action: 'read' }
      ],
      'monitoring': [
        { resource: 'health', action: 'read' },
        { resource: 'api/metrics', action: 'read' }
      ]
    };

    return permissionMap[clientId] || [{ resource: 'health', action: 'read' }];
  }

  private getDefaultRateLimits(clientId: string): { requests: number; windowMs: number } {
    const rateLimitMap: Record<string, { requests: number; windowMs: number }> = {
      'frontend': { requests: 1000, windowMs: 15 * 60 * 1000 }, // 1000 req/15min
      'mcp-server': { requests: 500, windowMs: 15 * 60 * 1000 }, // 500 req/15min
      'admin-scripts': { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 req/15min
      'monitoring': { requests: 200, windowMs: 15 * 60 * 1000 } // 200 req/15min
    };

    return rateLimitMap[clientId] || { requests: 50, windowMs: 15 * 60 * 1000 };
  }

  private getClientDisplayName(clientId: string): string {
    const nameMap: Record<string, string> = {
      'frontend': 'Next.js Frontend',
      'mcp-server': 'MCP Analytics Server',
      'admin-scripts': 'Administrative Scripts',
      'monitoring': 'System Monitoring'
    };

    return nameMap[clientId] || `Client ${clientId}`;
  }

  async validateToken(token: string): Promise<TechnicalClient | null> {
    const clientId = this.tokenToClientMap.get(token);
    
    if (!clientId) {
      return null;
    }

    const client = this.technicalClients.get(clientId);
    
    if (!client || !client.isActive) {
      return null;
    }

    // Update last used timestamp
    await this.updateLastUsed(clientId);
    
    return client;
  }

  async getTechnicalClient(clientId: string): Promise<TechnicalClient | null> {
    return this.technicalClients.get(clientId) || null;
  }

  async getAllClients(): Promise<TechnicalClient[]> {
    return Array.from(this.technicalClients.values());
  }

  hasPermission(client: TechnicalClient, resource: string, action: string): boolean {
    return client.permissions.some(permission => 
      this.matchesPermission(permission, resource, action)
    );
  }

  private matchesPermission(permission: Permission, resource: string, action: string): boolean {
    // Simple wildcard matching
    const resourceMatches = permission.resource === '*' || 
                           resource.startsWith(permission.resource) ||
                           permission.resource === resource;
    
    const actionMatches = permission.action === '*' || permission.action === action;
    
    return resourceMatches && actionMatches;
  }

  async updateLastUsed(clientId: string): Promise<void> {
    const client = this.technicalClients.get(clientId);
    if (client) {
      client.lastUsed = new Date();
    }
  }

  // Utility methods for token generation (development use)
  generateToken(length: number = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }
}