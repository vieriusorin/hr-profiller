import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../shared/types';
import { RoleMatchingService } from '../../../domain/opportunity/services/role-matching.service';

@injectable()
export class RoleMatchingSSEController {
  constructor(
    @inject(TYPES.RoleMatchingService)
    private readonly roleMatchingService: RoleMatchingService
  ) { }

  /**
   * Start real-time role matching with SSE
   */
  async startRoleMatching(req: Request, res: Response): Promise<void> {
    const { roleId, limit = 10, token } = req.query;
    const timestamp = new Date().toISOString();

    console.log(`\n${'='.repeat(100)}`);
    console.log(`🚀 [SSE Controller] ${timestamp} - New SSE connection request`);
    console.log(`🚀 [SSE Controller] Request details:`);
    console.log(`   - Role ID: ${roleId}`);
    console.log(`   - Limit: ${limit}`);
    console.log(`   - Client IP: ${req.ip}`);
    console.log(`   - User Agent: ${req.get('User-Agent')}`);
    console.log(`   - Origin: ${req.get('Origin')}`);
    console.log(`   - Referer: ${req.get('Referer')}`);
    console.log(`   - Has Token in Query: ${!!token}`);
    console.log(`   - Token Preview: ${token ? `${String(token).substring(0, 20)}...` : 'none'}`);
    console.log(`   - Authorization Header: ${req.get('Authorization') ? 'Present' : 'Missing'}`);
    console.log(`   - Request Method: ${req.method}`);
    console.log(`   - Request URL: ${req.url}`);
    console.log(`   - Query Params: ${JSON.stringify(req.query)}`);
    console.log(`${'='.repeat(100)}\n`);

    // Enhanced validation
    if (!roleId || typeof roleId !== 'string') {
      console.error('❌ [SSE Controller] ERROR: Role ID is missing or invalid');
      console.error('❌ [SSE Controller] Received roleId:', roleId, 'Type:', typeof roleId);
      res.status(400).json({ error: 'Role ID is required' });
      return;
    }

    // TEMPORARY: Skip token validation for testing
    // if (!token && !req.get('Authorization')) {
    //   console.error('❌ [SSE Controller] ERROR: No authentication token provided');
    //   res.status(401).json({ error: 'Authentication token is required' });
    //   return;
    // }
    console.log('⚠️  [SSE Controller] BYPASSING TOKEN VALIDATION FOR TESTING');

    // Set SSE headers
    console.log('📡 [SSE Controller] Setting SSE headers...');
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    };
    
    console.log('📡 [SSE Controller] Headers to set:', headers);
    res.writeHead(200, headers);
    console.log('✅ [SSE Controller] SSE headers set successfully');
    console.log('✅ [SSE Controller] Response headers sent, connection should be established');

    try {
      // Send initial status immediately to test connection
      const msg1 = {
        type: 'status',
        message: 'Starting AI-powered candidate search...',
        progress: 0
      };
      console.log('📤 [SSE Controller] Preparing to send message 1:', msg1);
      const msg1Data = `data: ${JSON.stringify(msg1)}\n\n`;
      console.log('📤 [SSE Controller] Raw SSE data 1:', JSON.stringify(msg1Data));
      res.write(msg1Data);
      console.log('✅ [SSE Controller] Message 1 sent successfully');

      // Force flush to ensure immediate delivery
      if ((res as any).flush) {
        (res as any).flush();
        console.log('✅ [SSE Controller] Response flushed after message 1');
      }

      // Wait a moment to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send progress update
      const msg2 = {
        type: 'status',
        message: 'Analyzing role requirements...',
        progress: 20
      };
      console.log('📤 [SSE Controller] Preparing to send message 2:', msg2);
      const msg2Data = `data: ${JSON.stringify(msg2)}\n\n`;
      console.log('📤 [SSE Controller] Raw SSE data 2:', JSON.stringify(msg2Data));
      res.write(msg2Data);
      console.log('✅ [SSE Controller] Message 2 sent successfully');

      // Force flush again
      if ((res as any).flush) {
        (res as any).flush();
        console.log('✅ [SSE Controller] Response flushed after message 2');
      }

      // Get candidates with progress updates
      console.log('[SSE Controller] 🔍 Calling roleMatchingService.getTopCandidatesForRole...');
      const startTime = Date.now();
      const candidates = await this.roleMatchingService.getTopCandidatesForRole(
        roleId,
        parseInt(limit as string)
      );
      const duration = Date.now() - startTime;
      console.log(`[SSE Controller] ✅ Service returned ${candidates.length} candidates in ${duration}ms`);

      // Send progress update
      const msg3 = {
        type: 'status',
        message: `Found ${candidates.length} potential candidates`,
        progress: 80
      };
      console.log('[SSE Controller] 📤 Sending message 3:', msg3);
      res.write(`data: ${JSON.stringify(msg3)}\n\n`);
      console.log('[SSE Controller] ✅ Message 3 sent');

      // Send final results
      const msg4 = {
        type: 'complete',
        message: 'Candidate analysis complete!',
        progress: 100,
        data: {
          candidates,
          totalFound: candidates.length,
          roleId
        }
      };
      console.log('[SSE Controller] 📤 Sending final message:', {
        ...msg4,
        data: { ...msg4.data, candidates: `[${candidates.length} items]` }
      });
      res.write(`data: ${JSON.stringify(msg4)}\n\n`);
      console.log('[SSE Controller] ✅ Final message sent');

    } catch (error) {
      console.error('[SSE Controller] ❌ ERROR occurred:', error);
      console.error('[SSE Controller] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      // Send error
      const errorMsg = {
        type: 'error',
        message: 'Failed to find candidates',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.log('[SSE Controller] 📤 Sending error message:', errorMsg);
      res.write(`data: ${JSON.stringify(errorMsg)}\n\n`);
    } finally {
      // Close the connection
      console.log('[SSE Controller] 🔌 Closing SSE connection');
      res.end();
      console.log('[SSE Controller] ✅ SSE connection closed\n');
    }
  }
}
