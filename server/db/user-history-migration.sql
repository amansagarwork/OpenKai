-- Migration: Create user_history table for tracking all user activities
-- This includes uploads, downloads, URL creations, terminal sessions, etc.

CREATE TABLE IF NOT EXISTS user_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'paste', 'paste_download', 'url', 'terminal_session', 'lint_check', etc.
  item_id VARCHAR(100), -- paste_id, short_id, session_id, etc.
  file_name VARCHAR(255),
  file_size INTEGER,
  content_type VARCHAR(100),
  action VARCHAR(50) DEFAULT 'create', -- 'create', 'download', 'view', 'delete'
  metadata JSONB DEFAULT '{}', -- additional flexible data
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_created_at ON user_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_history_item_type ON user_history(item_type);

-- Function to cleanup old history entries (keep last 1000 per user)
CREATE OR REPLACE FUNCTION cleanup_old_user_history()
RETURNS void AS $$
BEGIN
  DELETE FROM user_history
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM user_history
    ) ranked WHERE rn > 1000
  );
END;
$$ LANGUAGE plpgsql;
