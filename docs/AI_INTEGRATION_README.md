# AI Integration with RAG (Retrieval-Augmented Generation)

This document explains the AI integration in the Profiller HR system, which uses RAG (Retrieval-Augmented Generation) to provide intelligent analysis of person profiles.

## 🏗️ Architecture Overview

The AI integration consists of three main components:

### 1. **Backend AI Services** (`backend/src/domain/ai/`)
- **OpenAI Service**: Handles embeddings generation and direct AI calls
- **Vector Database Service**: Manages pgvector operations for similarity search
- **RAG Service**: Orchestrates the entire RAG workflow

### 2. **MCP Server** (`mcp-server/`)
- **AI Tool Hub**: Exposes AI tools via HTTP endpoints
- **OpenAI Integration**: Handles AI analysis and chat completions
- **Swagger Documentation**: API documentation for all MCP tools

### 3. **Database Layer**
- **pgvector Extension**: Enables vector similarity search in PostgreSQL
- **Embeddings Tables**: Store person embeddings and search metadata

## 🔄 How RAG Works

### The Complete Flow:

1. **Frontend Request** → Backend AI Controller
2. **Backend RAG Service** orchestrates:
   - Gets person data with all related information
   - Generates/fetches embeddings for the person
   - Finds similar persons using vector similarity search
   - Assembles context (person + similar persons + skills context)
3. **MCP Server** receives context and performs AI analysis
4. **OpenAI** generates intelligent analysis using the context
5. **Response** flows back: OpenAI → MCP Server → Backend → Frontend

### Detailed Steps:

```mermaid
graph TD
    A[Frontend: Analyze Person] --> B[Backend: AI Controller]
    B --> C[RAG Service: Get Person Data]
    C --> D[RAG Service: Generate Embeddings]
    D --> E[OpenAI: text-embedding-3-small]
    E --> F[Vector DB: Store Embeddings]
    F --> G[RAG Service: Find Similar Persons]
    G --> H[Vector DB: Similarity Search]
    H --> I[RAG Service: Assemble Context]
    I --> J[MCP Server: analyze_data Tool]
    J --> K[OpenAI: GPT-4 Analysis]
    K --> L[Response: AI Analysis]
    L --> M[Frontend: Display Results]
```

## 🚀 Getting Started

### Prerequisites

1. **OpenAI API Key**: Set in environment variables
2. **PostgreSQL with pgvector**: For vector similarity search
3. **Node.js**: For running the services

### Environment Setup

#### Backend (`.env`)
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4-turbo-preview

# MCP Server Configuration
MCP_SERVER_URL=http://localhost:3002

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/profiller_hr
```

#### MCP Server (`mcp-server/.env`)
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3002
NODE_ENV=development
```

### Starting the Services

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the MCP Server**:
   ```bash
   cd mcp-server
   npm install
   npm run dev
   ```

3. **Verify Services**:
   - Backend: http://localhost:3001/api-docs
   - MCP Server: http://localhost:3002/api-docs

## 📡 API Endpoints

### Backend AI Endpoints

#### 1. Analyze Person with RAG
```http
POST /api/v1/ai/analyze
Content-Type: application/json

{
  "personId": "uuid",
  "analysisType": "capability_analysis",
  "includeSimilarPersons": true,
  "includeSkillsContext": true
}
```

**Analysis Types:**
- `capability_analysis`: Comprehensive skill and capability assessment
- `skill_gap`: Identify missing skills and development opportunities
- `career_recommendation`: Career path and role transition suggestions
- `general`: General professional analysis

#### 2. Find Similar Persons
```http
POST /api/v1/ai/similar
Content-Type: application/json

{
  "query": "JavaScript React TypeScript",
  "limit": 10,
  "similarityThreshold": 0.7
}
```

#### 3. Generate Embeddings
```http
POST /api/v1/ai/embeddings/generate
Content-Type: application/json

{
  "personId": "uuid",
  "embeddingType": "profile"
}
```

#### 4. Batch Embedding Generation
```http
POST /api/v1/ai/embeddings/generate-all
```

#### 5. Get RAG Statistics
```http
GET /api/v1/ai/stats
```

#### 6. Health Check
```http
GET /api/v1/ai/health
```

### MCP Server Endpoints

#### 1. List Available Tools
```http
GET /tools
```

#### 2. Execute AI Analysis
```http
POST /tools/analyze_data
Content-Type: application/json

{
  "arguments": {
    "data": "JSON string with person context",
    "analysisType": "capability_analysis"
  }
}
```

## 🧠 Understanding the AI Analysis

### What the AI Receives

The AI gets a comprehensive context including:

1. **Person Profile**:
   - Name, email, position
   - Skills and technologies
   - Education background
   - Notes and additional information

2. **Similar Professionals** (if enabled):
   - Top 3 similar persons with similarity scores
   - Their skills and positions for comparison

3. **Market Context** (if enabled):
   - Skills market demand information
   - Industry trends and positioning

### AI Analysis Output

The AI provides structured analysis including:

- **Current Strengths**: Key areas of expertise
- **Skill Gaps**: Missing skills compared to similar professionals
- **Development Opportunities**: Learning paths and recommendations
- **Career Trajectory**: Assessment of career progression
- **Market Positioning**: How the person fits in the market

## 🔧 Configuration Options

### RAG Service Configuration

```typescript
interface AnalysisRequest {
  personId: string;
  analysisType: 'capability_analysis' | 'skill_gap' | 'career_recommendation' | 'general';
  includeSimilarPersons?: boolean; // Default: true
  includeSkillsContext?: boolean;  // Default: false
}
```

### Vector Search Configuration

```typescript
// Similarity search parameters
const searchConfig = {
  limit: 5,              // Number of similar persons to find
  similarityThreshold: 0.7, // Minimum similarity score (0-1)
  embeddingType: 'profile'  // Type of embedding to search
};
```

## 📊 Monitoring and Analytics

### RAG Statistics

The system tracks:
- Total embeddings generated
- Search performance metrics
- Cost tracking for OpenAI usage
- Similarity search statistics

### Health Monitoring

Health checks verify:
- OpenAI API connectivity
- Vector database connectivity
- MCP server status
- Embedding generation capability

## 🛠️ Development and Testing

### Testing the Integration

1. **Generate Embeddings**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/ai/embeddings/generate-all
   ```

2. **Test Person Analysis**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/ai/analyze \
     -H "Content-Type: application/json" \
     -d '{"personId": "your-person-id", "analysisType": "capability_analysis"}'
   ```

3. **Test Similarity Search**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/ai/similar \
     -H "Content-Type: application/json" \
     -d '{"query": "JavaScript React", "limit": 5}'
   ```

### Debugging

1. **Check MCP Server Health**:
   ```bash
   curl http://localhost:3002/health
   ```

2. **Check Backend AI Health**:
   ```bash
   curl http://localhost:3001/api/v1/ai/health
   ```

3. **View RAG Statistics**:
   ```bash
   curl http://localhost:3001/api/v1/ai/stats
   ```

## 🔒 Security Considerations

1. **API Key Management**: Store OpenAI API keys securely
2. **Rate Limiting**: Implement rate limiting for AI endpoints
3. **Data Privacy**: Ensure person data is handled securely
4. **Cost Monitoring**: Monitor OpenAI usage to control costs

## 🚀 Performance Optimization

1. **Embedding Caching**: Reuse existing embeddings when possible
2. **Batch Operations**: Use batch embedding generation for efficiency
3. **Similarity Thresholds**: Adjust thresholds based on data quality
4. **Context Optimization**: Limit context size for faster processing

## 📈 Future Enhancements

1. **Advanced Prompting**: Implement more sophisticated prompt engineering
2. **Multi-Modal Analysis**: Support for resume parsing and document analysis
3. **Real-time Updates**: Automatic embedding updates when person data changes
4. **Advanced Analytics**: More detailed market analysis and trends
5. **Custom Models**: Fine-tuned models for specific HR use cases

## 🤝 Contributing

When contributing to the AI integration:

1. **Follow the Architecture**: Maintain separation between backend and MCP server
2. **Add Tests**: Include tests for new AI functionality
3. **Update Documentation**: Keep this README and API docs current
4. **Monitor Performance**: Ensure new features don't impact performance
5. **Security Review**: Review security implications of new features

## 📞 Support

For issues with the AI integration:

1. Check the health endpoints for service status
2. Review logs for detailed error information
3. Verify OpenAI API key and quota
4. Ensure pgvector extension is properly installed
5. Check MCP server connectivity

---

This AI integration provides a powerful foundation for intelligent HR analysis while maintaining scalability, security, and cost-effectiveness. 