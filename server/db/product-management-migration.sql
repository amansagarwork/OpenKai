-- Product Management Database Schema
-- Supports Jira-style project management with issues, sprints, and boards

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    state VARCHAR(20) DEFAULT 'future' CHECK (state IN ('future', 'active', 'closed')),
    start_date DATE,
    end_date DATE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issues table (Stories, Tasks, Bugs, Epics)
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL, -- e.g., PROD-101
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'task' CHECK (type IN ('story', 'task', 'bug', 'epic')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('lowest', 'low', 'medium', 'high', 'highest')),
    status VARCHAR(20) DEFAULT 'backlog' CHECK (status IN ('backlog', 'selected', 'in-progress', 'done')),
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
    parent_id INTEGER REFERENCES issues(id) ON DELETE SET NULL, -- For subtasks/epics
    story_points INTEGER,
    labels TEXT[], -- Array of labels
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Issue comments
CREATE TABLE IF NOT EXISTS issue_comments (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issue history/activity log
CREATE TABLE IF NOT EXISTS issue_history (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    field VARCHAR(100) NOT NULL, -- e.g., 'status', 'assignee', 'sprint'
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprint-Issue relationship (many-to-many if needed)
CREATE TABLE IF NOT EXISTS sprint_issues (
    id SERIAL PRIMARY KEY,
    sprint_id INTEGER REFERENCES sprints(id) ON DELETE CASCADE,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sprint_id, issue_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(type);
CREATE INDEX IF NOT EXISTS idx_sprints_state ON sprints(state);
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_history_issue ON issue_history(issue_id);

-- Function to generate issue key
CREATE OR REPLACE FUNCTION generate_issue_key()
RETURNS TRIGGER AS $$
DECLARE
    project_key TEXT := 'PROD';
    issue_number INTEGER;
BEGIN
    -- Get the next number for this project
    SELECT COUNT(*) + 1 INTO issue_number FROM issues;
    NEW.key := project_key || '-' || issue_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate issue key
DROP TRIGGER IF EXISTS trg_generate_issue_key ON issues;
CREATE TRIGGER trg_generate_issue_key
    BEFORE INSERT ON issues
    FOR EACH ROW
    EXECUTE FUNCTION generate_issue_key();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_sprints_updated_at ON sprints;
CREATE TRIGGER trg_sprints_updated_at
    BEFORE UPDATE ON sprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_issue_comments_updated_at ON issue_comments;
CREATE TRIGGER trg_issue_comments_updated_at
    BEFORE UPDATE ON issue_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
