-- Create a function to clean up expired pastes
CREATE OR REPLACE FUNCTION cleanup_expired_pastes()
RETURNS void AS $$
BEGIN
  DELETE FROM pastes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Drop the job if it already exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('cleanup_expired_pastes');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Extension might not exist, which is fine
  RAISE NOTICE 'pg_cron extension not available';
END $$;

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup to run every hour
SELECT cron.schedule(
  'cleanup_expired_pastes',
  '0 * * * *',  -- Run at the start of every hour
  'SELECT cleanup_expired_pastes()'
);

-- For development: Also add a more frequent job (every 5 minutes)
-- This is optional and can be removed in production
SELECT cron.schedule(
  'cleanup_expired_pastes_frequent',
  '*/5 * * * *',  -- Run every 5 minutes
  'SELECT cleanup_expired_pastes()'
);
