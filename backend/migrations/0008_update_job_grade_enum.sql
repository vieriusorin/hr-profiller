-- Drop existing enum type after removing dependencies
ALTER TABLE employment_details ALTER COLUMN job_grade DROP DEFAULT;
ALTER TABLE opportunity_roles ALTER COLUMN job_grade DROP DEFAULT;

-- Drop the existing enum type
DROP TYPE job_grade;

-- Create the new enum type with updated values
CREATE TYPE job_grade AS ENUM ('JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM');

-- Update the columns to use the new enum type
ALTER TABLE employment_details ALTER COLUMN job_grade TYPE job_grade USING job_grade::text::job_grade;
ALTER TABLE opportunity_roles ALTER COLUMN job_grade TYPE job_grade USING job_grade::text::job_grade; 