import { Request, Response } from 'express';
import pool from '../config/db';

// Types
interface Issue {
  id: number;
  key: string;
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status: 'backlog' | 'selected' | 'in-progress' | 'done';
  assignee_id?: number;
  reporter_id?: number;
  sprint_id?: number;
  parent_id?: number;
  story_points?: number;
  labels: string[];
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

interface Sprint {
  id: number;
  name: string;
  goal: string;
  state: 'future' | 'active' | 'closed';
  start_date?: Date;
  end_date?: Date;
  created_by?: number;
}

// Get all issues with optional filters
export const getIssues = async (req: Request, res: Response) => {
  try {
    const { status, sprint_id, assignee_id, type, search } = req.query;
    
    console.log('[BACKEND] Get issues request:', {
      query: req.query,
      status,
      sprint_id,
      assignee_id,
      type,
      search,
      url: req.url,
      method: req.method
    });
    
    let query = `
      SELECT i.*, 
        u_assignee.username as assignee_name,
        u_reporter.username as reporter_name,
        s.name as sprint_name
      FROM issues i
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN sprints s ON i.sprint_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND i.status = $${paramIndex++}`;
      params.push(status);
    }

    if (sprint_id) {
      query += ` AND i.sprint_id = $${paramIndex++}`;
      params.push(sprint_id);
    }

    if (assignee_id) {
      query += ` AND i.assignee_id = $${paramIndex++}`;
      params.push(assignee_id);
    }

    if (type) {
      query += ` AND i.type = $${paramIndex++}`;
      params.push(type);
    }

    if (search) {
      query += ` AND (i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex} OR i.key ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY i.created_at DESC';

    console.log('[BACKEND] Final query:', query);
    console.log('[BACKEND] Query params:', params);

    const result = await pool.query(query, params);
    
    console.log('[BACKEND] Issues found:', result.rows.length);
    console.log('[BACKEND] Issues with due dates:', result.rows.filter(i => i.due_date).length);
    console.log('[BACKEND] Sample issues:', result.rows.slice(0, 3).map(i => ({
      id: i.id,
      key: i.key,
      title: i.title,
      status: i.status,
      due_date: i.due_date
    })));
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('[BACKEND] Get issues error:', error);
    res.status(500).json({ error: 'Failed to get issues' });
  }
};

// Get single issue by ID
export const getIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT i.*,
        u_assignee.username as assignee_name,
        u_reporter.username as reporter_name,
        s.name as sprint_name
      FROM issues i
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN sprints s ON i.sprint_id = s.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Get comments
    const commentsResult = await pool.query(`
      SELECT c.*, u.username as user_name
      FROM issue_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.issue_id = $1
      ORDER BY c.created_at ASC
    `, [id]);

    // Get history
    const historyResult = await pool.query(`
      SELECT h.*, u.username as user_name
      FROM issue_history h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE h.issue_id = $1
      ORDER BY h.created_at DESC
    `, [id]);

    res.status(200).json({
      ...result.rows[0],
      comments: commentsResult.rows,
      history: historyResult.rows
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to get issue' });
  }
};

// Create new issue
export const createIssue = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    const {
      title,
      description,
      type = 'task',
      priority = 'medium',
      status = 'backlog',
      assignee, // This is the assignee name from frontend
      sprint_id,
      parent_id,
      story_points,
      labels = [],
      due_date,
      estimated_hours,
      actual_hours
    } = req.body;

    console.log('[BACKEND] Create issue request:', {
      title,
      description,
      type,
      priority,
      status,
      assignee,
      sprint_id,
      parent_id,
      story_points,
      labels,
      due_date,
      estimated_hours,
      actual_hours
    });

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // If assignee is provided as a name, convert to assignee_id
    let assignee_id = null;
    if (assignee && typeof assignee === 'string') {
      try {
        const userResult = await pool.query(
          'SELECT id FROM users WHERE username = $1 OR email = $1 LIMIT 1',
          [assignee]
        );
        if (userResult.rows.length > 0) {
          assignee_id = userResult.rows[0].id;
        }
      } catch (error) {
        console.log('[BACKEND] Could not find user for assignee:', assignee);
      }
    }

    // Generate issue key
    const keyResult = await pool.query(
      'SELECT COUNT(*) as count FROM issues WHERE key LIKE $1',
      ['PROD-%']
    );
    const count = parseInt(keyResult.rows[0].count) + 1;
    const key = `PROD-${count}`;

    const result = await pool.query(`
      INSERT INTO issues (key, title, description, type, priority, status, assignee_id, reporter_id, sprint_id, parent_id, story_points, labels, due_date, estimated_hours, actual_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      key,
      title, 
      description, 
      type, 
      priority, 
      status, 
      assignee_id, 
      user?.userId, 
      sprint_id || null, 
      parent_id || null, 
      story_points ? parseInt(story_points) : null, 
      labels, // Pass array directly to PostgreSQL
      due_date || null,
      estimated_hours ? parseFloat(estimated_hours) : null,
      actual_hours ? parseFloat(actual_hours) : null
    ]);

    console.log('[BACKEND] Issue created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[BACKEND] Create issue error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: 'Failed to create issue', details: errorMessage });
  }
};

// Update issue
export const updateIssue = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    const { id } = req.params;
    const updates = req.body;

    // Get current issue for history tracking
    const currentIssue = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (currentIssue.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const oldIssue = currentIssue.rows[0];

    // Handle assignee name to ID conversion
    let assignee_id = updates.assignee_id;
    if (updates.assignee && typeof updates.assignee === 'string') {
      try {
        const userResult = await pool.query(
          'SELECT id FROM users WHERE username = $1 OR email = $1 LIMIT 1',
          [updates.assignee]
        );
        if (userResult.rows.length > 0) {
          assignee_id = userResult.rows[0].id;
        }
      } catch (error) {
        console.log('[BACKEND] Could not find user for assignee:', updates.assignee);
      }
    }

    // Build update query
    const allowedFields = ['title', 'description', 'type', 'priority', 'status', 'assignee_id', 'sprint_id', 'parent_id', 'story_points', 'labels', 'due_date', 'estimated_hours', 'actual_hours'];
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'assignee_id') {
          setClauses.push(`${key} = $${paramIndex++}`);
          values.push(assignee_id);
        } else if (key === 'story_points') {
          setClauses.push(`${key} = $${paramIndex++}`);
          values.push(value ? parseInt(String(value), 10) : null);
        } else if (key === 'estimated_hours' || key === 'actual_hours') {
          setClauses.push(`${key} = $${paramIndex++}`);
          values.push(value ? parseFloat(String(value)) : null);
        } else if (key === 'labels') {
          setClauses.push(`${key} = $${paramIndex++}`);
          values.push(JSON.stringify(value));
        } else {
          setClauses.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }

        // Log history for status and assignee changes
        if ((key === 'status' || key === 'assignee_id') && value !== oldIssue[key]) {
          const oldValue = oldIssue[key] ? String(oldIssue[key]) : '';
          const newValue = value ? String(value) : '';
          await pool.query(`
            INSERT INTO issue_history (issue_id, user_id, field, old_value, new_value)
            VALUES ($1, $2, $3, $4, $5)
          `, [id, user?.userId, key, oldValue, newValue]);
        }
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const query = `UPDATE issues SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await pool.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('[BACKEND] Update issue error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: 'Failed to update issue', details: errorMessage });
  }
};

// Delete issue
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM issues WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
};

// Get all sprints
export const getSprints = async (req: Request, res: Response) => {
  try {
    const { state } = req.query;
    
    let query = 'SELECT * FROM sprints WHERE 1=1';
    const params: any[] = [];

    if (state) {
      query += ' AND state = $1';
      params.push(state);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Get issue counts for each sprint
    const sprintsWithCounts = await Promise.all(
      result.rows.map(async (sprint) => {
        const issuesResult = await pool.query(
          'SELECT COUNT(*) as count FROM issues WHERE sprint_id = $1',
          [sprint.id]
        );
        return { ...sprint, issue_count: parseInt(issuesResult.rows[0].count) };
      })
    );

    res.status(200).json(sprintsWithCounts);
  } catch (error) {
    console.error('Get sprints error:', error);
    res.status(500).json({ error: 'Failed to get sprints' });
  }
};

// Create sprint
export const createSprint = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    const { name, goal, state = 'future', start_date, end_date } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(`
      INSERT INTO sprints (name, goal, state, start_date, end_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, goal, state, start_date, end_date, user?.userId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create sprint error:', error);
    res.status(500).json({ error: 'Failed to create sprint' });
  }
};

// Update sprint
export const updateSprint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, goal, state, start_date, end_date } = req.body;

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (goal !== undefined) {
      setClauses.push(`goal = $${paramIndex++}`);
      values.push(goal);
    }
    if (state !== undefined) {
      setClauses.push(`state = $${paramIndex++}`);
      values.push(state);
    }
    if (start_date !== undefined) {
      setClauses.push(`start_date = $${paramIndex++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      setClauses.push(`end_date = $${paramIndex++}`);
      values.push(end_date);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE sprints SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update sprint error:', error);
    res.status(500).json({ error: 'Failed to update sprint' });
  }
};

// Delete sprint
export const deleteSprint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM sprints WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.status(200).json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Delete sprint error:', error);
    res.status(500).json({ error: 'Failed to delete sprint' });
  }
};

// Get board data (issues grouped by status)
export const getBoard = async (req: Request, res: Response) => {
  try {
    const { sprint_id } = req.query;
    
    console.log(`[BACKEND] Get board request:`, {
      sprint_id,
      query: req.query,
      url: req.url,
      method: req.method
    });
    
    let query = `
      SELECT i.*, 
        u_assignee.username as assignee_name,
        u_reporter.username as reporter_name,
        s.name as sprint_name
      FROM issues i
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN sprints s ON i.sprint_id = s.id
    `;
    const params: any[] = [];

    if (sprint_id) {
      query += ' WHERE i.sprint_id = $1';
      params.push(sprint_id);
    } else {
      // Default to active sprint or backlog
      query += ' WHERE (i.sprint_id IS NULL OR i.sprint_id IN (SELECT id FROM sprints WHERE state = $1))';
      params.push('active');
    }

    query += ' ORDER BY i.updated_at DESC';

    console.log('[BACKEND] Board query:', query);
    console.log('[BACKEND] Board params:', params);

    const result = await pool.query(query, params);
    
    console.log(`[BACKEND] Found ${result.rows.length} issues`);
    console.log('[BACKEND] Issues with due dates:', result.rows.filter(i => i.due_date).length);
    console.log('[BACKEND] Sample board issues:', result.rows.slice(0, 3).map(i => ({
      id: i.id,
      key: i.key,
      title: i.title,
      status: i.status,
      due_date: i.due_date,
      assignee_name: i.assignee_name
    })));
    
    // Group by status
    const board = {
      backlog: result.rows.filter((i: Issue) => i.status === 'backlog'),
      selected: result.rows.filter((i: Issue) => i.status === 'selected'),
      'in-progress': result.rows.filter((i: Issue) => i.status === 'in-progress'),
      done: result.rows.filter((i: Issue) => i.status === 'done')
    };
    
    console.log(`[BACKEND] Board: backlog=${board.backlog.length}, selected=${board.selected.length}, in-progress=${board['in-progress'].length}, done=${board.done.length}`);

    res.status(200).json(board);
  } catch (error) {
    console.error('[BACKEND] Get board error:', error);
    res.status(500).json({ error: 'Failed to get board' });
  }
};

// Move issue (drag and drop)
export const moveIssue = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    const { id } = req.params;
    const { status, sprint_id } = req.body;

    console.log(`[BACKEND] Move request: issue=${id}, status=${status}, sprint_id=${sprint_id}`);

    // Get current issue for history
    const currentIssue = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (currentIssue.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const oldIssue = currentIssue.rows[0];
    console.log(`[BACKEND] Current issue:`, oldIssue);

    // Update issue - only update sprint_id if provided
    const updateSprintId = sprint_id !== undefined ? sprint_id : oldIssue.sprint_id;
    console.log(`[BACKEND] Updating to: status=${status}, sprint_id=${updateSprintId}`);

    const result = await pool.query(`
      UPDATE issues 
      SET status = $1, sprint_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, updateSprintId, id]);

    console.log(`[BACKEND] Update result:`, result.rows[0]);

    // Log history if status changed
    if (status && status !== oldIssue.status) {
      await pool.query(`
        INSERT INTO issue_history (issue_id, user_id, field, old_value, new_value)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, user?.userId, 'status', oldIssue.status, status]);
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('[BACKEND] Move issue error:', error);
    res.status(500).json({ error: 'Failed to move issue' });
  }
};

// Add comment to issue
export const addComment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(`
      INSERT INTO issue_comments (issue_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, user?.userId, content]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Test endpoint to verify database data
export const testDatabase = async (req: Request, res: Response) => {
  try {
    console.log('[BACKEND] Testing database connection...');
    
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW()');
    console.log('[BACKEND] Database time:', timeResult.rows[0]);
    
    // Test issues table
    const issuesResult = await pool.query('SELECT id, key, title, status, due_date FROM issues ORDER BY id');
    console.log('[BACKEND] All issues in database:', issuesResult.rows);
    
    // Test with specific due date
    const dueDateResult = await pool.query('SELECT * FROM issues WHERE due_date IS NOT NULL');
    console.log('[BACKEND] Issues with due dates:', dueDateResult.rows);
    
    res.status(200).json({
      message: 'Database test successful',
      time: timeResult.rows[0],
      issues: issuesResult.rows,
      issues_with_due_dates: dueDateResult.rows
    });
  } catch (error) {
    console.error('[BACKEND] Database test error:', error);
    res.status(500).json({ error: 'Database test failed', details: error });
  }
};

// Get calendar data (issues grouped by date)
export const getCalendar = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    console.log('[BACKEND] Get calendar request:', { month, year });
    
    // Get all issues with their details
    const result = await pool.query(`
      SELECT i.*, 
        u_assignee.username as assignee_name,
        u_reporter.username as reporter_name,
        s.name as sprint_name
      FROM issues i
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN sprints s ON i.sprint_id = s.id
      ORDER BY i.due_date ASC, i.created_at DESC
    `);
    
    console.log('[BACKEND] Total issues found:', result.rows.length);
    console.log('[BACKEND] Issues with due dates:', result.rows.filter(i => i.due_date).length);
    
    // Group issues by date
    const calendar: Record<string, any[]> = {};
    const noDueDate: any[] = [];
    
    result.rows.forEach((issue: Issue) => {
      if (issue.due_date) {
        const dateStr = issue.due_date.toISOString().split('T')[0];
        if (!calendar[dateStr]) {
          calendar[dateStr] = [];
        }
        calendar[dateStr].push(issue);
      } else {
        noDueDate.push(issue);
      }
    });
    
    console.log('[BACKEND] Calendar dates with issues:', Object.keys(calendar).length);
    console.log('[BACKEND] Issues without due date:', noDueDate.length);
    
    res.status(200).json({
      calendar,
      noDueDate,
      totalIssues: result.rows.length
    });
  } catch (error) {
    console.error('[BACKEND] Get calendar error:', error);
    res.status(500).json({ error: 'Failed to get calendar data' });
  }
};

// Get reports/statistics
export const getReports = async (req: Request, res: Response) => {
  try {
    // Sprint velocity
    const velocityResult = await pool.query(`
      SELECT s.name, COUNT(i.id) as completed_issues, SUM(i.story_points) as points
      FROM sprints s
      LEFT JOIN issues i ON i.sprint_id = s.id AND i.status = 'done'
      WHERE s.state = 'closed'
      GROUP BY s.id, s.name
      ORDER BY s.end_date DESC
      LIMIT 5
    `);

    // Issue distribution
    const distributionResult = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM issues
      GROUP BY type
    `);

    // Status breakdown
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM issues
      GROUP BY status
    `);

    // Priority breakdown
    const priorityResult = await pool.query(`
      SELECT priority, COUNT(*) as count
      FROM issues
      GROUP BY priority
    `);

    res.status(200).json({
      velocity: velocityResult.rows,
      distribution: distributionResult.rows,
      status: statusResult.rows,
      priority: priorityResult.rows
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
};
