#!/usr/bin/env node

/**
 * Technical Token Generator
 * 
 * Utility script to generate secure technical tokens for the HR Profiler application.
 * This script creates cryptographically secure tokens that can be used in environment variables.
 * 
 * Usage:
 *   node scripts/generate-technical-tokens.js
 *   node scripts/generate-technical-tokens.js --production
 *   node scripts/generate-technical-tokens.js --clients frontend,mcp-server,admin-scripts
 */

const crypto = require('crypto');

// Default clients for HR Profiler application
const DEFAULT_CLIENTS = [
  'frontend',
  'mcp-server', 
  'admin-scripts',
  'monitoring'
];

// Production-grade token length (128 characters = 64 bytes * 2 for hex)
const PRODUCTION_TOKEN_LENGTH = 64;
const DEVELOPMENT_TOKEN_LENGTH = 32;

function generateSecureToken(length = PRODUCTION_TOKEN_LENGTH) {
  return crypto.randomBytes(length).toString('hex');
}

function generateClientTokens(clients, isProduction = false) {
  const tokenLength = isProduction ? PRODUCTION_TOKEN_LENGTH : DEVELOPMENT_TOKEN_LENGTH;
  const environment = isProduction ? 'prod' : 'dev';
  
  const tokens = {};
  
  clients.forEach(clientId => {
    const token = `tech_${clientId}_${environment}_${generateSecureToken(tokenLength)}`;
    tokens[clientId] = token;
  });
  
  return tokens;
}

function generateEnvironmentConfig(tokens, isProduction = false) {
  const envName = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';
  const jsonString = JSON.stringify(tokens, null, 0);
  
  console.log(`\n# ${envName} Technical Tokens Configuration`);
  console.log(`# Generated on: ${new Date().toISOString()}`);
  console.log(`# Token format: tech_{clientId}_{env}_{secureToken}`);
  console.log(`# Add this to your ${isProduction ? '.env.production' : '.env'} file:`);
  console.log('');
  console.log(`TECHNICAL_TOKENS='${jsonString}'`);
  
  if (isProduction) {
    console.log('');
    console.log('⚠️  PRODUCTION SECURITY NOTES:');
    console.log('   - These tokens provide system-level access');
    console.log('   - Store them securely (e.g., Azure Key Vault, AWS Secrets Manager)');
    console.log('   - Never commit them to source control');
    console.log('   - Rotate them periodically');
    console.log('   - Monitor their usage in production logs');
  }
}

function generateIndividualTokens(tokens) {
  console.log('\n# Individual Token Variables (alternative format):');
  Object.entries(tokens).forEach(([clientId, token]) => {
    const varName = `TECHNICAL_TOKEN_${clientId.toUpperCase().replace('-', '_')}`;
    console.log(`${varName}="${token}"`);
  });
}

function generateTokenUsageExamples(tokens) {
  console.log('\n# Usage Examples:');
  console.log('');
  
  Object.entries(tokens).forEach(([clientId, token]) => {
    let description, endpoint;
    
    switch (clientId) {
      case 'frontend':
        description = 'Next.js frontend making API calls';
        endpoint = '/api/v1/persons';
        break;
      case 'mcp-server':
        description = 'MCP server accessing AI endpoints';
        endpoint = '/api/v1/ai/analyze';
        break;
      case 'admin-scripts':
        description = 'Administrative scripts for bulk operations';
        endpoint = '/api/v1/admin/bulk-operations/users';
        break;
      case 'monitoring':
        description = 'Health monitoring systems';
        endpoint = '/api/v1/admin/health';
        break;
      default:
        description = `${clientId} client`;
        endpoint = '/api/v1/health';
    }
    
    console.log(`# ${description}:`);
    console.log(`curl -H "X-API-Key: ${token}" \\\n     -H "Content-Type: application/json" \\\n     http://localhost:4040${endpoint}`);
    console.log('');
  });
}

function main() {
  const args = process.argv.slice(2);
  const isProduction = args.includes('--production') || args.includes('-p');
  
  // Parse custom clients if provided
  let clients = DEFAULT_CLIENTS;
  const clientsIndex = args.findIndex(arg => arg.startsWith('--clients'));
  if (clientsIndex !== -1) {
    const clientsArg = args[clientsIndex];
    if (clientsArg.includes('=')) {
      clients = clientsArg.split('=')[1].split(',').map(c => c.trim());
    } else if (args[clientsIndex + 1]) {
      clients = args[clientsIndex + 1].split(',').map(c => c.trim());
    }
  }
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Technical Token Generator for HR Profiler');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/generate-technical-tokens.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --production, -p     Generate production-grade tokens (longer, more secure)');
    console.log('  --clients <list>     Comma-separated list of client IDs');
    console.log('  --help, -h          Show this help message');
    console.log('');
    console.log('Default clients: ' + DEFAULT_CLIENTS.join(', '));
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/generate-technical-tokens.js');
    console.log('  node scripts/generate-technical-tokens.js --production');
    console.log('  node scripts/generate-technical-tokens.js --clients frontend,backend,monitoring');
    return;
  }
  
  console.log('🔐 HR Profiler Technical Token Generator');
  console.log('==========================================');
  
  const tokens = generateClientTokens(clients, isProduction);
  
  console.log(`\nGenerated ${Object.keys(tokens).length} technical tokens for:`);
  clients.forEach(client => console.log(`  - ${client}`));
  
  generateEnvironmentConfig(tokens, isProduction);
  generateIndividualTokens(tokens);
  generateTokenUsageExamples(tokens);
  
  console.log('\n# Next Steps:');
  console.log('1. Copy the TECHNICAL_TOKENS environment variable to your .env file');
  console.log('2. Restart your application to load the new tokens');
  console.log('3. Test the tokens using the curl examples above');
  console.log('4. Update your client applications to use the new tokens');
  
  if (isProduction) {
    console.log('\n⚠️  PRODUCTION DEPLOYMENT:');
    console.log('- Use a secure secret management service');
    console.log('- Set up token rotation procedures');
    console.log('- Monitor token usage and audit logs');
    console.log('- Test all integrations after token updates');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSecureToken,
  generateClientTokens,
  DEFAULT_CLIENTS
};