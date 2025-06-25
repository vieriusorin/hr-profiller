import 'dotenv/config';
import createServer from './interfaces/http/server';

async function bootstrap() {
  try {
    const app = createServer();
    const port = process.env.PORT || 3002;

    app.listen(port, () => {
      console.log('🤖 AI Capabilities: Advanced HR Analytics & Talent Intelligence');
    });
  } catch (error) {
    console.error('❌ Failed to start Enhanced HR MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
}); 