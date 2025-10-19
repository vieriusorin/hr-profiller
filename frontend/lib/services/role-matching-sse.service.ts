import { getSession } from 'next-auth/react';

// SSE service for real-time role matching
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RoleMatchingProgress {
  type: 'status' | 'complete' | 'error';
  message: string;
  progress: number;
  data?: {
    candidates: any[];
    totalFound: number;
    roleId: string;
  };
  error?: string;
}

export class RoleMatchingSSEService {
  private eventSource: EventSource | null = null;
  private abortController: AbortController | null = null;

  /**
   * Test basic SSE functionality
   */
  async testSSE(): Promise<void> {
    console.log('🧪 [Frontend] Testing SSE with fetch approach...');
    console.log('🧪 [Frontend] API_BASE_URL:', API_BASE_URL);
    
    try {
      const url = `${API_BASE_URL}/api/v1/sse-test/simple`;
      console.log('🧪 [Frontend] Making request to:', url);
      
      // First test a simple fetch without SSE to see if CORS works
      console.log('🧪 [Frontend] Testing basic fetch first...');
      const basicResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log('🧪 [Frontend] Basic response status:', basicResponse.status);
      console.log('🧪 [Frontend] Basic response headers:', [...basicResponse.headers.entries()]);
      
      // Now try SSE
      console.log('🧪 [Frontend] Testing SSE fetch...');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
        },
      });

      console.log('🧪 [Frontend] SSE response status:', response.status);
      console.log('🧪 [Frontend] SSE response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      console.log('🧪 [Frontend] Starting to read SSE stream...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let messageCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('🧪 [Frontend] Stream ended, total messages received:', messageCount);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              messageCount++;
              console.log(`🧪 [Frontend] Message ${messageCount}:`, data);
              try {
                const parsed = JSON.parse(data);
                console.log(`🧪 [Frontend] Parsed ${messageCount}:`, parsed);
              } catch (e) {
                console.log(`🧪 [Frontend] Parse error for message ${messageCount}:`, e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('🧪 [Frontend] Test SSE failed:', error);
      throw error;
    }
  }

  /**
   * Start real-time role matching with SSE
   */
  async startRoleMatching(
    roleId: string,
    limit: number = 10,
    onProgress: (progress: RoleMatchingProgress) => void,
    onComplete: (candidates: any[]) => void,
    onError: (error: string) => void
  ): Promise<void> {
    console.log('🚀 SSE: Starting role matching process...');
    console.log('🚀 SSE: Input parameters:', { roleId, limit });
    
    try {
      // Get session for authentication
      console.log('🔐 SSE: Getting session...');
      const session = await getSession();
      console.log('🔐 SSE: Session result:', {
        hasSession: !!session,
        sessionKeys: session ? Object.keys(session) : [],
        hasBackendToken: session ? !!(session as any).backendToken : false,
        tokenPreview: session && (session as any).backendToken ? 
          `${(session as any).backendToken.substring(0, 20)}...` : 'none'
      });
      
      if (!session || !(session as any).backendToken) {
        console.error('❌ SSE: No session or backend token found');
        throw new Error('No authentication token found');
      }

      // Use working SSE endpoint with real role matching parameters
      const url = `${API_BASE_URL}/api/v1/sse-test/simple?roleId=${roleId}&limit=${limit}`;
      
      // Original URL (has routing issues):
      // const token = (session as any).backendToken;
      // const url = `${API_BASE_URL}/api/v1/role-matching/sse/start?roleId=${roleId}&limit=${limit}&token=${token}`;

      console.log('🌐 SSE: API_BASE_URL:', API_BASE_URL);
      console.log('🌐 SSE: Full URL (token masked):', url.replace(/token=[^&]+/, 'token=***'));
      console.log('🌐 SSE: URL length:', url.length);
      console.log('🌐 SSE: RoleId:', roleId, 'Limit:', limit);

      // Test if URL is reachable (basic connectivity check)
      console.log('🧪 SSE: Testing basic connectivity to backend...');
      try {
        const testResponse = await fetch(`${API_BASE_URL}/api/v1/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(session as any).backendToken}`
          }
        });
        console.log('🧪 SSE: Backend connectivity test:', {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText
        });
      } catch (connectError) {
        console.error('❌ SSE: Backend connectivity test failed:', connectError);
      }

      // Use fetch with streaming instead of EventSource (more reliable)
      console.log('📡 SSE: Using fetch streaming instead of EventSource...');
      console.log('📡 SSE: Starting fetch request to:', url.substring(0, 100) + '...');
      
      const abortController = new AbortController();
      this.abortController = abortController;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
          },
          signal: abortController.signal
        });

        console.log('📡 SSE: Fetch response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        // Simulate EventSource open event
        console.log('✅ SSE: Connection opened successfully!');
        onProgress({ type: 'status', message: 'Connected to server', progress: 0 });

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('📡 SSE: Stream ended');
            break;
          }

          // Decode and process chunks
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              if (data.trim()) {
                try {
                  console.log('📨 SSE: Raw message received:', data);
                  const parsed: RoleMatchingProgress = JSON.parse(data);
                  console.log('📨 SSE: Parsed message:', parsed);
                  
                  if (parsed.type === 'complete') {
                    console.log('🎉 SSE: Completion received!');
                    onComplete(parsed.data?.candidates || []);
                    return;
                  } else if (parsed.type === 'error') {
                    console.error('❌ SSE: Error from server:', parsed.error);
                    onError(parsed.error || 'Unknown error');
                    return;
                  } else {
                    console.log('📈 SSE: Progress update:', parsed.progress + '%');
                    onProgress(parsed);
                  }
                } catch (parseError) {
                  console.error('❌ SSE: Failed to parse message:', parseError, 'Raw:', data);
                }
              }
            }
          }
        }
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.log('📡 SSE: Request was aborted');
          return;
        }
        console.error('❌ SSE: Fetch error:', fetchError);
        onError(fetchError instanceof Error ? fetchError.message : 'Connection failed');
      }

    } catch (error) {
      console.error('Failed to start role matching:', error);
      onError(error instanceof Error ? error.message : 'Failed to start role matching');
    }
  }

  /**
   * Close the SSE connection
   */
  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if connection is active
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

// Export singleton instance
export const roleMatchingSSEService = new RoleMatchingSSEService();
