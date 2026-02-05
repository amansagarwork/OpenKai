-- Create the database if it doesn't exist
CREATE DATABASE open_paste;

-- Connect to the database
\c open_paste;

-- Create the pastes table
CREATE TABLE IF NOT EXISTS pastes (
  paste_id CHAR(6) PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  delete_token VARCHAR(64),
  
  -- Ensure paste_id follows the format: 3 lowercase letters + 3 digits
  CONSTRAINT paste_id_format CHECK (paste_id ~ '^[a-z]{3}[0-9]{3}$'),
  
  -- Ensure content is not empty
  CONSTRAINT content_not_empty CHECK (length(content) > 0)
);

-- Create an index on expires_at for faster cleanup of expired pastes
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at) 
WHERE expires_at IS NOT NULL;

-- Create a function to clean up expired pastes
CREATE OR REPLACE FUNCTION clean_expired_pastes()
RETURNS void AS $$
BEGIN
  DELETE FROM pastes 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the cleanup function every hour
-- Note: This requires the pg_cron extension to be installed
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('0 * * * *', 'SELECT clean_expired_pastes()');

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE open_paste TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Add a comment to the table for documentation
COMMENT ON TABLE pastes IS 'Stores paste content with expiration support';

-- Add comments to columns for documentation
COMMENT ON COLUMN pastes.paste_id IS 'Unique 6-character identifier (3 letters + 3 digits)';
COMMENT ON COLUMN pastes.content IS 'The actual paste content';
COMMENT ON COLUMN pastes.created_at IS 'When the paste was created';
COMMENT ON COLUMN pastes.expires_at IS 'When the paste should expire (NULL means never)';
COMMENT ON COLUMN pastes.delete_token IS 'Secret token that allows the creator to delete the paste';

-- Create a function to get the total number of pastes
CREATE OR REPLACE FUNCTION get_paste_count()
RETURNS bigint AS $$
DECLARE
  count bigint;
BEGIN
  SELECT COUNT(*) INTO count FROM pastes;
  RETURN count;
END;
$$ LANGUAGE plpgsql;
