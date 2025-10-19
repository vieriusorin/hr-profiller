import { getSession } from 'next-auth/react';

// Helper function to make API requests with authentication (matches api-client.ts pattern)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to refresh backend token (copied from api-client.ts)
async function refreshBackendToken(session: any): Promise<string | null> {
  try {
    console.log('Attempting to refresh backend token...');

    if (!session.user?.email) {
      console.error('No user email found for token refresh');
      return null;
    }

    // Use the refresh token endpoint
    const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: session.backendToken,
        expiresIn: '24h',
        clientId: 'user-session'
      }),
    });

    if (!refreshResponse.ok) {
      console.error('Token refresh failed:', refreshResponse.status);
      return null;
    }

    const refreshData = await refreshResponse.json();
    if (refreshData.success && refreshData.data?.token) {
      console.log('Backend token refreshed successfully');
      return refreshData.data.token;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing backend token:', error);
    return null;
  }
}

async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;

  let session = await getSession();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Debug logging
  console.log('Role Matching API Request Debug:', {
    hasSession: !!session,
    sessionKeys: session ? Object.keys(session) : [],
    hasBackendToken: session ? !!(session as any).backendToken : false,
    backendTokenPreview: session && (session as any).backendToken ? `${(session as any).backendToken.substring(0, 20)}...` : 'none'
  });

  if (session && (session as any).backendToken) {
    defaultHeaders['Authorization'] = `Bearer ${(session as any).backendToken}`;
  } else {
    console.warn('No backend token found in session for role matching API request');
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // If we get a 403 and it might be due to token expiry, try to refresh
    if (response.status === 403 && session && (session as any).backendToken) {
      console.log('Got 403, attempting token refresh...');

      const newToken = await refreshBackendToken(session);
      if (newToken) {
        // Update the session (note: this won't persist across page reloads)
        (session as any).backendToken = newToken;

        // Retry the request with the new token
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        };

        console.log('Retrying role matching request with refreshed token...');
        const retryResponse = await fetch(url, retryConfig);

        if (retryResponse.ok) {
          if (retryResponse.status === 204) {
            return {} as T;
          }
          return await retryResponse.json();
        }
      }

      // If refresh failed or retry failed, continue with original error
      console.error('Token refresh failed or retry failed for role matching');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    // Handle empty responses (204 No Content, etc.)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Role Match types
 */
export interface RoleMatch {
  personId: string;
  personName: string;
  roleId: string;
  roleName: string;
  matchScore: number; // 0-100
  matchReason: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  confidence: number; // 0-1
}

export interface RoleMatchingRequest {
  roleId?: string;
  opportunityId?: string;
  personIds?: string[];
  minMatchScore?: number;
  limit?: number;
}

export interface RoleMatchingResponse {
  matches: RoleMatch[];
  metadata: {
    totalPersonsAnalyzed: number;
    totalRolesAnalyzed: number;
    averageMatchScore: number;
    processingTime: number;
    timestamp: string;
  };
}

export interface SingleMatchRequest {
  personId: string;
  roleId: string;
}

export interface TopCandidatesResponse {
  roleId: string;
  candidates: RoleMatch[];
  count: number;
}

export interface PersonRolesResponse {
  personId: string;
  opportunityId?: string;
  roles: RoleMatch[];
  count: number;
}

/**
 * Role Matching Service
 * 
 * Service for AI-powered role matching functionality
 */
export class RoleMatchingService {
  private baseUrl = '/role-matching';

  /**
   * Find best matches for roles
   */
  async findMatches(request: RoleMatchingRequest): Promise<RoleMatchingResponse> {
    const response = await makeApiRequest<{ status: string; data: RoleMatchingResponse }>(
      `${this.baseUrl}/find-matches`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  /**
   * Match a single person to a single role
   */
  async matchPersonToRole(personId: string, roleId: string): Promise<RoleMatch> {
    const response = await makeApiRequest<{ status: string; data: RoleMatch }>(
      `${this.baseUrl}/match`,
      {
        method: 'POST',
        body: JSON.stringify({ personId, roleId }),
      }
    );
    return response.data;
  }

  /**
   * Get top candidates for a specific role
   */
  async getTopCandidatesForRole(roleId: string, limit: number = 10): Promise<RoleMatch[]> {
    const response = await makeApiRequest<{ status: string; data: TopCandidatesResponse }>(
      `${this.baseUrl}/role/${roleId}/candidates?limit=${limit}`
    );
    return response.data.candidates;
  }

  /**
   * Get all role matches for a specific person
   */
  async getRolesForPerson(personId: string, opportunityId?: string): Promise<RoleMatch[]> {
    const queryParam = opportunityId ? `?opportunityId=${opportunityId}` : '';
    const response = await makeApiRequest<{ status: string; data: PersonRolesResponse }>(
      `${this.baseUrl}/person/${personId}/roles${queryParam}`
    );
    return response.data.roles;
  }

  /**
   * Get all matches for an entire opportunity
   */
  async getMatchesForOpportunity(
    opportunityId: string,
    minMatchScore: number = 50,
    limit?: number
  ): Promise<RoleMatchingResponse> {
    const params = new URLSearchParams({ minMatchScore: minMatchScore.toString() });
    if (limit) params.append('limit', limit.toString());

    const response = await makeApiRequest<{ status: string; data: RoleMatchingResponse }>(
      `${this.baseUrl}/opportunity/${opportunityId}/matches?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get match score color based on score value
   */
  getMatchScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  /**
   * Get match score background color based on score value
   */
  getMatchScoreBgColor(score: number): string {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900';
    if (score >= 75) return 'bg-blue-100 dark:bg-blue-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900';
    return 'bg-red-100 dark:bg-red-900';
  }

  /**
   * Get match score label
   */
  getMatchScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Strong Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Moderate Match';
    return 'Poor Match';
  }

  /**
   * Format confidence as percentage
   */
  formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }
}

// Export singleton instance
export const roleMatchingService = new RoleMatchingService();

