-- Drop tables (in reverse dependency order to avoid foreign key issues)
DROP TABLE IF EXISTS application_metrics CASCADE;
DROP TABLE IF EXISTS employee_stats CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS applicants CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop new tables
DROP TABLE IF EXISTS meeting_participants CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS project_team_members CASCADE;
DROP TABLE IF EXISTS project_technologies CASCADE;
DROP TABLE IF EXISTS employee_skills CASCADE;
DROP TABLE IF EXISTS candidate_skills CASCADE;
DROP TABLE IF EXISTS work_experience CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Drop enums
DROP TYPE IF EXISTS application_status;
DROP TYPE IF EXISTS employee_type;

-- Recreate enums
CREATE TYPE application_status AS ENUM ('applied', 'screening', 'interview', 'offer', 'rejected');
CREATE TYPE employee_type AS ENUM ('full_time', 'part_time', 'contractor');

-- Recreate tables

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  manager_id INTEGER,
  location VARCHAR(100),
  budget DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
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
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE technologies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  birth_date DATE,
  city VARCHAR(100),
  country VARCHAR(100),
  notes TEXT,
  hourly_rate DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  role VARCHAR(100),
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id),
  employee_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  birth_date DATE,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  
  hire_date DATE NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  position VARCHAR(100) NOT NULL,
  employment_type VARCHAR(50),
  salary DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  
  manager_id INTEGER REFERENCES employees(id),
  status VARCHAR(50) NOT NULL,
  termination_date DATE,
  
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add self-reference for department manager after employees table is created
ALTER TABLE departments ADD CONSTRAINT fk_department_manager FOREIGN KEY (manager_id) REFERENCES employees(id);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  description TEXT,
  budget DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  employment_type VARCHAR(50),
  status VARCHAR(50),
  client_id INTEGER REFERENCES clients(id),
  project_manager_id INTEGER REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE positions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  description TEXT,
  requirements TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(100),
  field_of_study VARCHAR(100),
  start_date DATE,
  graduation_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (candidate_id IS NOT NULL OR employee_id IS NOT NULL)
);

CREATE TABLE work_experience (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  job_title VARCHAR(100) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  location VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  employment_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (candidate_id IS NOT NULL OR employee_id IS NOT NULL)
);

CREATE TABLE candidate_skills (
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50),
  years_of_experience INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (candidate_id, skill_id)
);

CREATE TABLE employee_skills (
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50),
  years_of_experience INTEGER,
  is_certified BOOLEAN DEFAULT FALSE,
  certification_name VARCHAR(255),
  certification_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (employee_id, skill_id)
);

CREATE TABLE project_technologies (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id INTEGER NOT NULL REFERENCES technologies(id),
  proficiency_required VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, technology_id)
);

CREATE TABLE project_team_members (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  role VARCHAR(100),
  hourly_rate DECIMAL(10,2),
  allocation_percentage INTEGER,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, employee_id)
);

CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_type VARCHAR(50) NOT NULL,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  
  location VARCHAR(255),
  virtual_meeting_link VARCHAR(255),
  virtual_meeting_id VARCHAR(100),
  virtual_meeting_password VARCHAR(100),
  
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  
  related_position_id INTEGER REFERENCES positions(id),
  related_candidate_id INTEGER REFERENCES candidates(id),
  related_project_id INTEGER REFERENCES projects(id),
  
  created_by_id INTEGER NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_time_minutes INTEGER,
  notes TEXT
);

CREATE TABLE meeting_participants (
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  participant_type VARCHAR(50) NOT NULL,
  employee_id INTEGER REFERENCES employees(id),
  candidate_id INTEGER REFERENCES candidates(id),
  client_id INTEGER REFERENCES clients(id),
  external_email VARCHAR(255),
  external_name VARCHAR(255),
  
  is_organizer BOOLEAN DEFAULT FALSE,
  is_required BOOLEAN DEFAULT TRUE,
  response_status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (meeting_id, participant_type, COALESCE(employee_id, 0), COALESCE(candidate_id, 0), COALESCE(client_id, 0), COALESCE(external_email, ''))
);

-- Legacy tables
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applicants (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  applicant_id INTEGER NOT NULL REFERENCES applicants(id),
  role_id INTEGER NOT NULL REFERENCES roles(id),
  status application_status NOT NULL DEFAULT 'applied',
  in_progress BOOLEAN DEFAULT FALSE,
  notes TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  screening_at TIMESTAMP,
  interview_at TIMESTAMP,
  offer_at TIMESTAMP,
  rejected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employee_stats (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  full_time_count INTEGER DEFAULT 0,
  part_time_count INTEGER DEFAULT 0,
  contractor_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE application_metrics (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  applied_count INTEGER DEFAULT 0,
  screening_count INTEGER DEFAULT 0,
  interview_count INTEGER DEFAULT 0,
  offer_count INTEGER DEFAULT 0,
  rejected_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  remaining_count INTEGER DEFAULT 0,
  in_progress_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);