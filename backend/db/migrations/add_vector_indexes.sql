-- Add HNSW vector indexes for optimized similarity search
-- This migration adds high-performance vector indexes for pgvector

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_person_embeddings_hnsw;

-- Add HNSW index for cosine similarity (best for normalized embeddings)
CREATE INDEX CONCURRENTLY idx_person_embeddings_hnsw 
ON person_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Add composite index for filtered similarity searches
CREATE INDEX CONCURRENTLY idx_person_embeddings_type_embedding 
ON person_embeddings USING hnsw (embedding vector_cosine_ops) 
INCLUDE (embedding_type, person_id)
WITH (m = 16, ef_construction = 64);

-- Analyze tables to update query planner statistics
ANALYZE person_embeddings;

-- Index configuration explanation:
-- m = 16: Good balance between build time and query performance
-- ef_construction = 64: Higher = more accurate but slower to build
-- CONCURRENTLY: Doesn't block concurrent operations during creation