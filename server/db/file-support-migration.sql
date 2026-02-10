-- Migration: Add file support to pastes table
-- Files stored as Base64 in BYTEA column, 2MB limit enforced in application

ALTER TABLE pastes 
  ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'text/plain',
  ADD COLUMN IF NOT EXISTS file_data BYTEA,
  ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Update constraint to allow empty content when file is present
ALTER TABLE pastes DROP CONSTRAINT IF EXISTS content_not_empty;
ALTER TABLE pastes ADD CONSTRAINT content_or_file_required 
  CHECK (length(content) > 0 OR file_data IS NOT NULL);

-- Create index for faster lookups by content type
CREATE INDEX IF NOT EXISTS idx_pastes_content_type ON pastes(content_type);
