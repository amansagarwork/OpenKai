-- Create a function to clean up expired pastes
CREATE OR REPLACE FUNCTION cleanup_expired_pastes()
RETURNS void AS $$
BEGIN
  DELETE FROM pastes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add username column to existing users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
    
    -- Add username format constraint
    ALTER TABLE users ADD CONSTRAINT username_format 
      CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$');
    
    -- Make username NOT NULL (first update existing rows, then add constraint)
    UPDATE users SET username = 'user_' || id WHERE username IS NULL;
    ALTER TABLE users ALTER COLUMN username SET NOT NULL;
  END IF;
END $$;

-- Create the pastes table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(320) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure username follows valid format (alphanumeric, underscores, hyphens, 3-50 chars)
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$')
);

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

ALTER TABLE pastes
  ADD COLUMN IF NOT EXISTS user_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pastes_user_id_fkey'
  ) THEN
    ALTER TABLE pastes
      ADD CONSTRAINT pastes_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Create an index on expires_at for faster cleanup of expired pastes
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at) 
WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pastes_user_id_created_at ON pastes(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Grant necessary permissions
CREATE TABLE IF NOT EXISTS shortened_urls (
  short_id CHAR(6) PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  clicks BIGINT DEFAULT 0
);

-- Add user_id column if table already exists without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shortened_urls' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE shortened_urls ADD COLUMN user_id BIGINT;
    ALTER TABLE shortened_urls ADD CONSTRAINT shortened_urls_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_shortened_urls_created_at ON shortened_urls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shortened_urls_user_id ON shortened_urls(user_id) WHERE user_id IS NOT NULL;

GRANT ALL PRIVILEGES ON shortened_urls TO postgres;

-- Create a trigger to clean up expired pastes on insert/update
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_pastes()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM pastes WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Only create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'trigger_cleanup_expired_pastes'
  ) THEN
    CREATE TRIGGER trigger_cleanup_expired_pastes
    AFTER INSERT OR UPDATE OF expires_at ON pastes
    EXECUTE FUNCTION trigger_cleanup_expired_pastes();
  END IF;
END $$;
