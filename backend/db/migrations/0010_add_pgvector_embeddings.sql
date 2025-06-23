-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create person_embeddings table
CREATE TABLE person_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  embedding_type VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  dimension INTEGER NOT NULL,
  embedding TEXT NOT NULL, -- JSON string of the vector
  searchable_text TEXT NOT NULL,
  tokens_used INTEGER,
  cost VARCHAR(20),
  metadata TEXT, -- JSON string for additional data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create similarity_searches table
CREATE TABLE similarity_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_embedding TEXT NOT NULL, -- JSON string of query vector
  embedding_type VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  results TEXT NOT NULL, -- JSON array of person IDs with similarity scores
  limit_count INTEGER DEFAULT 10,
  similarity_threshold VARCHAR(20),
  execution_time VARCHAR(20), -- in milliseconds
  tokens_used INTEGER,
  cost VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_person_embeddings_person_id ON person_embeddings(person_id);
CREATE INDEX idx_person_embeddings_type ON person_embeddings(embedding_type);
CREATE INDEX idx_person_embeddings_created_at ON person_embeddings(created_at);
CREATE INDEX idx_similarity_searches_created_at ON similarity_searches(created_at);

-- Add comments for documentation
COMMENT ON TABLE person_embeddings IS 'Stores vector embeddings for person profiles using pgvector';
COMMENT ON TABLE similarity_searches IS 'Stores similarity search results for caching and analytics';
COMMENT ON COLUMN person_embeddings.embedding IS 'JSON string representation of the vector embedding';
COMMENT ON COLUMN person_embeddings.embedding_type IS 'Type of embedding: profile, skills, technologies, etc.';
COMMENT ON COLUMN person_embeddings.metadata IS 'JSON string containing person metadata for quick access'; 