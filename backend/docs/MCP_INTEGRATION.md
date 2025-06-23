# MCP (Model Context Protocol) Integration

This document explains how the MCP integration works in the Profiller HR backend and how to use it.

## Overview

The MCP integration allows the backend to communicate with AI tools through a standardized protocol. This enables AI-powered features like:

- Data analysis
- Report generation
- Capability assessment
- AI-driven insights

## Architecture

The MCP integration follows the existing Domain-Driven Design (DDD) pattern:

```
backend/
├── src/
│   ├── domain/
│   │   └── mcp/
│   │       └── services/
│   │           └── mcp-client.service.ts    # MCP client service
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   └── mcp.controller.ts       # MCP HTTP controller
│   │   │   └── routes/
│   │   │       └── mcp.ts                  # MCP routes
│   │   └── container.ts                    # Dependency injection
│   └── shared/
│       └── types/
│           └── index.ts                    # MCP types
```

## Components

### 1. McpClientService

Located at `src/domain/mcp/services/mcp-client.service.ts`

This service handles communication with the MCP server:

- **Health checks**: Verify MCP server connectivity
- **Tool discovery**: Get available AI tools
- **Tool execution**: Execute AI tools with parameters
- **Data analysis**: Analyze data using AI
- **Report generation**: Generate AI-powered reports

### 2. McpController

Located at `src/infrastructure/http/controllers/mcp.controller.ts`

HTTP controller that exposes MCP functionality via REST API:

- `GET /api/v1/mcp/tools` - List available MCP tools
- `POST /api/v1/mcp/analyze` - Analyze data using MCP
- `POST /api/v1/mcp/report` - Generate reports using MCP
- `POST /api/v1/mcp/execute` - Execute any MCP tool
- `GET /api/v1/mcp/health` - Check MCP server health

### 3. Integration with Business Logic

The MCP service is integrated into existing business logic. For example, in `PersonService`:

- `analyzePersonCapabilitiesWithAI()` - Analyze person capabilities using AI
- `generatePersonReport()` - Generate AI-powered person reports

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# MCP Server Configuration
MCP_SERVER_URL=http://mcp-server:3002
```

### Docker Configuration

The MCP server should be running as a separate service. Add to your `docker-compose.yml`:

```yaml
services:
  mcp-server:
    build: ./mcp-server
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
    networks:
      - app-network
```

## Usage Examples

### 1. Basic MCP Tool Execution

```typescript
// In any service that injects McpClientService
const result = await this.mcpClientService.executeTool('analyze_data', {
  data: 'Your data here',
  analysisType: 'capability_analysis'
});
```

### 2. Person Capability Analysis

```bash
# Analyze a person's capabilities using AI
curl -X POST http://localhost:3000/api/v1/persons/{personId}/analyze-ai \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "capability_analysis"}'
```

### 3. Generate AI Report

```bash
# Generate an AI-powered report for a person
curl -X POST http://localhost:3000/api/v1/persons/{personId}/generate-report \
  -H "Content-Type: application/json" \
  -d '{"reportType": "comprehensive"}'
```

### 4. Direct MCP Tool Execution

```bash
# Execute any MCP tool directly
curl -X POST http://localhost:3000/api/v1/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "analyze_data",
    "arguments": {
      "data": "Your data here",
      "analysisType": "custom_analysis"
    }
  }'
```

## API Endpoints

### MCP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mcp/tools` | List available MCP tools |
| POST | `/api/v1/mcp/analyze` | Analyze data using MCP |
| POST | `/api/v1/mcp/report` | Generate reports using MCP |
| POST | `/api/v1/mcp/execute` | Execute any MCP tool |
| GET | `/api/v1/mcp/health` | Check MCP server health |

### AI-Enhanced Person Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/persons/:id/analyze-ai` | Analyze person capabilities using AI |
| POST | `/api/v1/persons/:id/generate-report` | Generate AI-powered report for person |

## Error Handling

The MCP integration includes comprehensive error handling:

- **Connection errors**: When MCP server is unreachable
- **Tool execution errors**: When AI tools fail
- **Validation errors**: When input data is invalid
- **Timeout errors**: When operations take too long

All errors are logged and returned with appropriate HTTP status codes.

## Future Enhancements

### Vector Database Integration

For RAG (Retrieval-Augmented Generation) capabilities:

1. **Embeddings**: Store person data as vector embeddings
2. **Similarity Search**: Find similar persons using vector similarity
3. **Context Retrieval**: Retrieve relevant context for AI analysis

### OpenAI Integration

For enhanced AI capabilities:

1. **Embedding Generation**: Use OpenAI to create embeddings
2. **Advanced Analysis**: Leverage GPT models for deeper insights
3. **Custom Prompts**: Create domain-specific prompts for HR analysis

### Example RAG Implementation

```typescript
// Future implementation example
async analyzePersonWithRAG(personId: string): Promise<string> {
  // 1. Get person data
  const person = await this.personRepository.findById(personId, true);
  
  // 2. Generate embeddings
  const embeddings = await this.openaiService.createEmbeddings(person);
  
  // 3. Store in vector database
  await this.vectorDb.storeEmbeddings(personId, embeddings);
  
  // 4. Find similar persons
  const similarPersons = await this.vectorDb.findSimilar(embeddings, 5);
  
  // 5. Use MCP with RAG context
  return await this.mcpClientService.executeTool('analyze_with_context', {
    personData: person,
    similarPersons,
    analysisType: 'rag_enhanced'
  });
}
```

## Testing

### Health Check

```bash
curl http://localhost:3000/api/v1/mcp/health
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "healthy": true,
    "mcpServer": "connected"
  }
}
```

### Tool Discovery

```bash
curl http://localhost:3000/api/v1/mcp/tools
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "tools": [
      {
        "name": "analyze_data",
        "description": "Analyze data from your application",
        "inputSchema": {...}
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Reachable**
   - Check if MCP server is running
   - Verify `MCP_SERVER_URL` environment variable
   - Check network connectivity

2. **Tool Execution Failures**
   - Verify tool name exists
   - Check input schema validation
   - Review MCP server logs

3. **Timeout Errors**
   - Increase timeout in `McpClientService`
   - Check MCP server performance
   - Consider async processing for long operations

### Debug Mode

Enable debug logging by setting:

```env
DEBUG_MCP=true
```

This will log all MCP requests and responses for debugging. 