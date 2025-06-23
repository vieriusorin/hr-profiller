# AI & RAG Integration Guide

This document explains the comprehensive AI integration in the Profiller HR backend, including OpenAI embeddings, pgvector similarity search, and MCP (Model Context Protocol) for AI-powered analysis.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MCP Server    │
│                 │    │                 │    │                 │
│ - Person Search │───▶│ - OpenAI Service│───▶│ - AI Tools      │
│ - AI Analysis   │    │ - pgvector      │    │ - RAG Context   │
│ - Reports       │    │ - Embeddings    │    │ - Analysis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │                 │
                       │ - pgvector      │
                       │ - embeddings    │
                       │ - similarity    │
                       └─────────────────┘
```

## 🔧 **Components**

### 1. **OpenAI Service** (`src/domain/ai/services/openai.service.ts`)

Handles all OpenAI interactions:
- **Embedding Generation**: Creates vector embeddings for person profiles
- **Chat Completions**: Generates AI analysis and reports
- **Text Processing**: Converts person data to searchable text

### 2. **Vector Database Service** (`src/domain/ai/services/vector-database.service.ts`)

Manages pgvector operations:
- **Embedding Storage**: Stores person embeddings in PostgreSQL
- **Similarity Search**: Finds similar persons using cosine similarity
- **Performance Optimization**: Indexes and caching for fast searches

### 3. **RAG Service** (`src/domain/ai/services/rag.service.ts`)

Orchestrates the complete RAG pipeline:
- **Context Retrieval**: Finds similar persons for market context
- **Analysis Generation**: Combines person data with market context
- **Report Creation**: Generates comprehensive AI-powered reports

### 4. **MCP Integration** (`src/domain/mcp/services/mcp-client.service.ts`)

Routes AI requests to appropriate tools:
- **Tool Discovery**: Finds available AI tools
- **Request Routing**: Sends data to the right AI service
- **Response Processing**: Handles AI tool responses

## 🗄️ **Database Schema**

### Person Embeddings Table

```sql
CREATE TABLE person_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  embedding_type VARCHAR(50) NOT NULL, -- 'profile', 'skills', 'technologies'
  model VARCHAR(100) NOT NULL, -- OpenAI model used
  dimension INTEGER NOT NULL, -- Vector dimension
  embedding TEXT NOT NULL, -- JSON string of the vector
  searchable_text TEXT NOT NULL, -- Text that was embedded
  tokens_used INTEGER, -- Token usage for cost tracking
  cost VARCHAR(20), -- Cost in USD
  metadata TEXT, -- JSON string for additional data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Similarity Searches Table

```sql
CREATE TABLE similarity_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_embedding TEXT NOT NULL, -- JSON string of query vector
  embedding_type VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  results TEXT NOT NULL, -- JSON array of results
  limit_count INTEGER DEFAULT 10,
  similarity_threshold VARCHAR(20),
  execution_time VARCHAR(20), -- in milliseconds
  tokens_used INTEGER,
  cost VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 **API Endpoints**

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/embeddings/generate` | Generate embedding for a person |
| POST | `/api/v1/ai/embeddings/generate-all` | Generate embeddings for all persons |
| POST | `/api/v1/ai/search/similar` | Find similar persons using RAG |
| POST | `/api/v1/ai/analyze/rag` | Analyze person with RAG context |
| POST | `/api/v1/ai/report/rag` | Generate report with RAG context |
| GET | `/api/v1/ai/stats` | Get AI system statistics |

### MCP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mcp/tools` | List available MCP tools |
| POST | `/api/v1/mcp/analyze` | Analyze data using MCP |
| POST | `/api/v1/mcp/report` | Generate reports using MCP |
| POST | `/api/v1/mcp/execute` | Execute any MCP tool |
| GET | `/api/v1/mcp/health` | Check MCP server health |

## 📋 **Configuration**

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4-turbo-preview

# MCP Server Configuration
MCP_SERVER_URL=http://mcp-server:3002

# Database Configuration (existing)
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

### Docker Configuration

Add to your `docker-compose.yml`:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: profiller_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mcp-server:
    build: ./mcp-server
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
    networks:
      - app-network
```

## 🔄 **Workflow Examples**

### 1. **Generate Person Embedding**

```bash
# Generate embedding for a specific person
curl -X POST http://localhost:3000/api/v1/ai/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "123e4567-e89b-12d3-a456-426614174000",
    "embeddingType": "profile"
  }'
```

### 2. **Find Similar Persons**

```bash
# Find persons similar to a query
curl -X POST http://localhost:3000/api/v1/ai/search/similar \
  -H "Content-Type: application/json" \
  -d '{
    "query": "React developer with 5 years experience",
    "limit": 10,
    "similarityThreshold": 0.7
  }'
```

### 3. **Analyze Person with RAG**

```bash
# Analyze a person with market context
curl -X POST http://localhost:3000/api/v1/ai/analyze/rag \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "123e4567-e89b-12d3-a456-426614174000",
    "analysisType": "comprehensive"
  }'
```

### 4. **Generate RAG Report**

```bash
# Generate comprehensive report with market context
curl -X POST http://localhost:3000/api/v1/ai/report/rag \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "123e4567-e89b-12d3-a456-426614174000",
    "reportType": "comprehensive"
  }'
```

## 🧠 **RAG Process Flow**

### 1. **Embedding Generation**
```
Person Data → Searchable Text → OpenAI Embedding → pgvector Storage
```

### 2. **Similarity Search**
```
Query Text → OpenAI Embedding → pgvector Similarity Search → Similar Persons
```

### 3. **Context Preparation**
```
Similar Persons → Market Analysis → Context Generation → RAG Context
```

### 4. **AI Analysis**
```
Person Data + RAG Context → MCP Tool → AI Analysis → Structured Response
```

## 💰 **Cost Tracking**

The system tracks costs for:
- **Embedding Generation**: ~$0.00002 per 1K tokens
- **Chat Completions**: ~$0.01-0.03 per 1K tokens
- **Vector Storage**: Minimal PostgreSQL storage costs

### Cost Optimization

1. **Batch Processing**: Generate embeddings for multiple persons at once
2. **Caching**: Cache similarity search results
3. **Model Selection**: Use smaller models for embeddings, larger for analysis
4. **Token Management**: Optimize text preprocessing to reduce tokens

## 🔍 **Similarity Search Details**

### Cosine Similarity

The system uses cosine similarity for vector comparison:

```sql
-- Example pgvector query
SELECT person_id, 
       1 - (embedding::vector <=> '[0.1, 0.2, 0.3, ...]'::vector) as similarity
FROM person_embeddings 
WHERE embedding_type = 'profile'
  AND 1 - (embedding::vector <=> '[0.1, 0.2, 0.3, ...]'::vector) >= 0.7
ORDER BY similarity DESC
LIMIT 10;
```

### Searchable Text Generation

The system generates searchable text from person data:

```typescript
// Example searchable text
"john doe john.doe@email.com javascript frontend advanced 5 years react frontend advanced 3 years stanford university computer science"
```

## 📊 **Performance Optimization**

### 1. **Database Indexes**
```sql
CREATE INDEX idx_person_embeddings_person_id ON person_embeddings(person_id);
CREATE INDEX idx_person_embeddings_type ON person_embeddings(embedding_type);
CREATE INDEX idx_person_embeddings_created_at ON person_embeddings(created_at);
```

### 2. **Vector Indexes** (for large datasets)
```sql
-- Create HNSW index for fast similarity search
CREATE INDEX ON person_embeddings USING hnsw (embedding vector_cosine_ops);
```

### 3. **Caching Strategy**
- Cache similarity search results
- Cache person embeddings
- Cache market analysis results

## 🧪 **Testing**

### Health Check
```bash
curl http://localhost:3000/api/v1/ai/stats
```

### Embedding Generation Test
```bash
# Test embedding generation
curl -X POST http://localhost:3000/api/v1/ai/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{"personId": "test-person-id", "embeddingType": "profile"}'
```

### Similarity Search Test
```bash
# Test similarity search
curl -X POST http://localhost:3000/api/v1/ai/search/similar \
  -H "Content-Type: application/json" \
  -d '{"query": "software engineer", "limit": 5}'
```

## 🚨 **Troubleshooting**

### Common Issues

1. **pgvector Extension Not Available**
   ```bash
   # Install pgvector extension
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **OpenAI API Key Missing**
   ```bash
   # Set environment variable
   export OPENAI_API_KEY=your_api_key_here
   ```

3. **MCP Server Not Reachable**
   ```bash
   # Check MCP server health
   curl http://localhost:3002/health
   ```

4. **Vector Dimension Mismatch**
   - Ensure all embeddings use the same model
   - Check embedding dimensions match

### Debug Mode

Enable debug logging:
```env
DEBUG_AI=true
DEBUG_VECTOR=true
DEBUG_RAG=true
```

## 🔮 **Future Enhancements**

### 1. **Advanced RAG Features**
- Multi-modal embeddings (text + structured data)
- Hierarchical embeddings (person → skills → technologies)
- Temporal embeddings (evolution over time)

### 2. **Enhanced AI Tools**
- Skill gap analysis
- Career path recommendations
- Salary benchmarking
- Market trend analysis

### 3. **Performance Improvements**
- Async embedding generation
- Real-time similarity updates
- Advanced caching strategies
- Distributed vector search

### 4. **Integration Features**
- Slack/Teams notifications
- Email reports
- Dashboard analytics
- API rate limiting

## 📚 **Additional Resources**

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [RAG Best Practices](https://arxiv.org/abs/2312.10997) 