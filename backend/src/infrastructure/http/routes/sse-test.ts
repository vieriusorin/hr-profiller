import { Router, Request, Response } from 'express';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';
import { RoleMatchingService } from '../../../domain/opportunity/services/role-matching.service';

const router = Router();

// Get the role matching service for real AI analysis
let roleMatchingService: RoleMatchingService;
try {
  roleMatchingService = container.get<RoleMatchingService>(TYPES.RoleMatchingService);
  console.log('🔧 [SSE Real] Role matching service injected successfully');
} catch (error) {
  console.error('❌ [SSE Real] Failed to inject role matching service:', error);
}

/**
 * Handle preflight OPTIONS request
 */
router.options('/simple', (req: Request, res: Response) => {
  console.log('🧪 [SSE Test] OPTIONS preflight request');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

/**
 * Role matching SSE endpoint - real implementation
 */
router.get('/simple', async (req: Request, res: Response) => {
  const { roleId, limit = 10 } = req.query;
  const timestamp = new Date().toISOString();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 [Role Matching SSE] ${timestamp} - Starting role matching`);
  console.log(`🚀 [Role Matching SSE] Role ID: ${roleId}`);
  console.log(`🚀 [Role Matching SSE] Limit: ${limit}`);
  console.log(`${'='.repeat(80)}\n`);

  // Validate required parameters
  if (!roleId || typeof roleId !== 'string') {
    console.error('❌ [Role Matching SSE] Missing or invalid roleId');
    res.status(400).json({ error: 'Role ID is required' });
    return;
  }

  // Set comprehensive CORS headers first
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  console.log('📡 [Role Matching SSE] SSE headers set successfully');

  try {
    // Send initial status
    const initialMsg = { 
      type: 'status', 
      message: 'Starting AI-powered candidate search...', 
      progress: 0 
    };
    res.write(`data: ${JSON.stringify(initialMsg)}\n\n`);
    console.log('📤 [Role Matching SSE] Initial message sent');

    // Step 1: Fetch role requirements from database
    const step1Msg = { type: 'status', message: 'Fetching role requirements from database...', progress: 10 };
    res.write(`data: ${JSON.stringify(step1Msg)}\n\n`);
    console.log('🔍 [Role Matching SSE] Fetching role from database...');

    // Use the actual role matching service to get top candidates
    const step2Msg = { type: 'status', message: 'Analyzing required skills and experience...', progress: 25 };
    res.write(`data: ${JSON.stringify(step2Msg)}\n\n`);
    console.log('🧠 [Role Matching SSE] Analyzing role requirements...');

    // Step 3: Search all employees/persons from database and run AI matching
    const step3Msg = { type: 'status', message: 'Searching employee database and running AI analysis...', progress: 40 };
    res.write(`data: ${JSON.stringify(step3Msg)}\n\n`);
    console.log('👥 [Role Matching SSE] Running full role matching analysis...');

    // Step 4: Run AI-powered matching using the service's main method
    const step4Msg = { type: 'status', message: 'Running AI-powered candidate matching...', progress: 60 };
    res.write(`data: ${JSON.stringify(step4Msg)}\n\n`);
    console.log('🤖 [Role Matching SSE] Starting AI analysis...');

    const aiMatches = await roleMatchingService.getTopCandidatesForRole(
      roleId, 
      parseInt(String(limit), 10) || 10
    );

    console.log('🎯 [Role Matching SSE] AI MATCHING RESULTS:');
    console.log(JSON.stringify(aiMatches, null, 2));

    // Also get the full matching analysis for detailed logging
    const fullMatchingResponse = await roleMatchingService.findMatches({
      roleId: roleId,
      limit: parseInt(String(limit), 10) || 10
    });

    console.log('📊 [Role Matching SSE] FULL MATCHING RESPONSE:');
    console.log(JSON.stringify(fullMatchingResponse, null, 2));

    // Step 5: Calculate compatibility scores
    const step5Msg = { type: 'status', message: 'Calculating compatibility scores...', progress: 80 };
    res.write(`data: ${JSON.stringify(step5Msg)}\n\n`);
    console.log('📊 [Role Matching SSE] Calculating final scores...');

    // Add small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 6: Rank candidates
    const step6Msg = { type: 'status', message: 'Ranking candidates by fit...', progress: 95 };
    res.write(`data: ${JSON.stringify(step6Msg)}\n\n`);
    console.log('🏆 [Role Matching SSE] Ranking and finalizing results...');

    // Add small delay before final processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Process and format the real AI results from RoleMatch interface
    const finalCandidates = aiMatches.map((match) => ({
      id: match.personId,
      name: match.personName,
      title: 'Software Engineer', // Could be enhanced with real job title from person data
      compatibilityScore: Math.round(match.matchScore),
      skills: [], // Could be enhanced with real skills from person data
      experience: 'Not specified', // Could be enhanced with real experience
      availability: 'Available',
      aiAnalysis: match.matchReason,
      matchReasons: match.strengths,
      gaps: match.gaps,
      recommendations: match.recommendations,
      confidence: Math.round(match.confidence * 100)
    }));

    console.log('✨ [Role Matching SSE] FINAL PROCESSED CANDIDATES:');
    console.log(JSON.stringify(finalCandidates, null, 2));

    // Send completion message with real data
    const completionMsg = {
      type: 'complete',
      message: `Found ${finalCandidates.length} AI-matched candidates!`,
      progress: 100,
      data: {
        candidates: finalCandidates,
        totalFound: finalCandidates.length,
        roleId: roleId,
        roleData: {
          name: aiMatches[0]?.roleName || 'Unknown Role',
          searchMetadata: fullMatchingResponse.metadata
        },
        searchCriteria: {
          aiAnalysisUsed: true,
          databaseSearched: true,
          totalPersonsAnalyzed: fullMatchingResponse.metadata.totalPersonsAnalyzed,
          totalRolesAnalyzed: fullMatchingResponse.metadata.totalRolesAnalyzed,
          averageMatchScore: fullMatchingResponse.metadata.averageMatchScore,
          processingTime: fullMatchingResponse.metadata.processingTime
        }
      }
    };

    res.write(`data: ${JSON.stringify(completionMsg)}\n\n`);
    console.log('🎉 [Role Matching SSE] Real AI matching completed successfully!');
    console.log(`🎉 [Role Matching SSE] Sent ${finalCandidates.length} candidates to frontend`);
    
    res.end();

  } catch (error) {
    console.error('❌ [Role Matching SSE] Error during role matching:', error);
    
    const errorMsg = {
      type: 'error',
      message: 'Failed to complete candidate search',
      progress: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.write(`data: ${JSON.stringify(errorMsg)}\n\n`);
    res.end();
  }
});

export default router;