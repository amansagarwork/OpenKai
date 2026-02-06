-- Create terminal_sessions table to track terminal sessions with nanoid
CREATE TABLE IF NOT EXISTS terminal_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(21) UNIQUE NOT NULL, -- nanoid (21 chars)
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100), -- optional name for the session
    status VARCHAR(20) DEFAULT 'active', -- active, closed, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_terminal_sessions_user_id ON terminal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_terminal_sessions_session_id ON terminal_sessions(session_id);

-- Create terminal_commands table to store command history
CREATE TABLE IF NOT EXISTS terminal_commands (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(21) NOT NULL REFERENCES terminal_sessions(session_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    stdout TEXT,
    stderr TEXT,
    exit_code INTEGER DEFAULT 0,
    working_directory VARCHAR(500),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_terminal_commands_session_id ON terminal_commands(session_id);
CREATE INDEX IF NOT EXISTS idx_terminal_commands_user_id ON terminal_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_terminal_commands_executed_at ON terminal_commands(executed_at);
