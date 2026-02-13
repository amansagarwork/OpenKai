-- Add new fields to issues table for enhanced issue tracking
-- Migration: 001_add_enhanced_issue_fields.sql

-- Add new columns to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS key VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10,2);

-- Create index for key field for faster lookups
CREATE INDEX IF NOT EXISTS idx_issues_key ON issues(key);

-- Create index for due_date for calendar queries
CREATE INDEX IF NOT EXISTS idx_issues_due_date ON issues(due_date);

-- Update existing issues to have keys if they don't have them
UPDATE issues 
SET key = 'PROD-' || id 
WHERE key IS NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN issues.key IS 'Unique issue identifier in format PROD-{number}';
COMMENT ON COLUMN issues.due_date IS 'Due date for the issue';
COMMENT ON COLUMN issues.estimated_hours IS 'Estimated hours to complete the issue';
COMMENT ON COLUMN issues.actual_hours IS 'Actual hours spent on the issue';
