-- Migration: Add slug support for SEO-friendly URLs
-- Slugs are URL-friendly versions of content titles/descriptions

ALTER TABLE pastes 
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_pastes_slug ON pastes(slug);

-- Function to generate URL-friendly slug
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Convert to lowercase
  result := LOWER(input_text);
  
  -- Replace spaces and special chars with hyphens
  result := REGEXP_REPLACE(result, '[^a-z0-9\s-]', '', 'g');
  result := REGEXP_REPLACE(result, '\s+', '-', 'g');
  result := REGEXP_REPLACE(result, '-+', '-', 'g');
  
  -- Trim hyphens from start and end
  result := TRIM(BOTH '-' FROM result);
  
  -- Limit to 60 chars
  result := LEFT(result, 60);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint (optional - slugs must be unique)
-- ALTER TABLE pastes ADD CONSTRAINT unique_slug UNIQUE (slug);
