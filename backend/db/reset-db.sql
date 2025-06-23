-- Drop tables (in reverse dependency order to avoid foreign key issues)
DROP TABLE IF EXISTS opportunity_role_assignments CASCADE;
DROP TABLE IF EXISTS opportunity_roles CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS person_unavailable_dates CASCADE;
DROP TABLE IF EXISTS person_technologies CASCADE;
DROP TABLE IF EXISTS person_skills CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS employment_details CASCADE;
DROP TABLE IF EXISTS person_status CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Drop enums
DROP TYPE IF EXISTS person_status_enum;
DROP TYPE IF EXISTS job_grade;
DROP TYPE IF EXISTS employee_status;
DROP TYPE IF EXISTS work_status;
DROP TYPE IF EXISTS opportunity_status;
DROP TYPE IF EXISTS opportunity_level;
DROP TYPE IF EXISTS role_status;

-- Create enums (only the ones actually used)
CREATE TYPE person_status_enum AS ENUM ('candidate', 'employee', 'former_employee', 'inactive');
CREATE TYPE job_grade AS ENUM ('JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM');
CREATE TYPE employee_status AS ENUM ('Active', 'On Leave', 'Inactive');
CREATE TYPE work_status AS ENUM ('On Project', 'On Bench', 'Available');
CREATE TYPE opportunity_status AS ENUM ('In Progress', 'On Hold', 'Done');
CREATE TYPE opportunity_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE role_status AS ENUM ('Open', 'Staffed', 'Won', 'Lost');

-- Create base tables (only the ones actually used)

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  description TEXT,
  version VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Normalized people-centric tables

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  birth_date DATE,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE person_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL UNIQUE REFERENCES people(id) ON DELETE CASCADE,
  status person_status_enum NOT NULL DEFAULT 'candidate',
  status_changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE,
  hire_date DATE NOT NULL,
  position VARCHAR(100) NOT NULL,
  employment_type VARCHAR(50),
  salary DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  manager_id UUID REFERENCES people(id),
  employee_status employee_status DEFAULT 'Active',
  work_status work_status DEFAULT 'Available',
  job_grade job_grade,
  location VARCHAR(100),
  termination_date DATE,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE person_unavailable_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(100),
  field_of_study VARCHAR(100),
  start_date DATE,
  graduation_date DATE,
  description TEXT,
  gpa VARCHAR(10),
  is_currently_enrolled VARCHAR(10) DEFAULT 'false',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE person_skills (
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50),
  years_of_experience VARCHAR(10),
  last_used DATE,
  is_certified BOOLEAN DEFAULT FALSE,
  certification_name VARCHAR(255),
  certification_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (person_id, skill_id)
);

CREATE TABLE person_technologies (
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50),
  years_of_experience VARCHAR(10),
  last_used DATE,
  context VARCHAR(100),
  project_name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (person_id, technology_id)
);

-- Opportunities tables

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_name VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES clients(id),
  client_name VARCHAR(255),
  expected_start_date DATE,
  expected_end_date DATE,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  status opportunity_status DEFAULT 'In Progress',
  comment TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE opportunity_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  role_name VARCHAR(255) NOT NULL,
  job_grade job_grade,
  level opportunity_level,
  allocation INTEGER CHECK (allocation >= 0 AND allocation <= 100),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status role_status DEFAULT 'Open',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE opportunity_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_role_id UUID NOT NULL REFERENCES opportunity_roles(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- AI and Vector Database tables

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