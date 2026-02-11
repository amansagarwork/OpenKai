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

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get issues error:', error);
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
      assignee_id,
      sprint_id,
      parent_id,
      story_points,
      labels = []
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(`
      INSERT INTO issues (title, description, type, priority, status, assignee_id, reporter_id, sprint_id, parent_id, story_points, labels)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [title, description, type, priority, status, assignee_id, user?.userId, sprint_id, parent_id, story_points, labels]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue' });
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

    // Build update query
    const allowedFields = ['title', 'description', 'type', 'priority', 'status', 'assignee_id', 'sprint_id', 'parent_id', 'story_points', 'labels'];
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(value);

        // Log history for status and assignee changes
        if ((key === 'status' || key === 'assignee_id') && value !== oldIssue[key]) {
          await pool.query(`
            INSERT INTO issue_history (issue_id, user_id, field, old_value, new_value)
            VALUES ($1, $2, $3, $4, $5)
          `, [id, user?.userId, key, oldIssue[key], value]);
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
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Failed to update issue' });
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

    const result = await pool.query(query, params);
    
    // Group by status
    const board = {
      backlog: result.rows.filter((i: Issue) => i.status === 'backlog'),
      selected: result.rows.filter((i: Issue) => i.status === 'selected'),
      'in-progress': result.rows.filter((i: Issue) => i.status === 'in-progress'),
      done: result.rows.filter((i: Issue) => i.status === 'done')
    };

    res.status(200).json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to get board' });
  }
};

// Move issue (drag and drop)
export const moveIssue = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    const { id } = req.params;
    const { status, sprint_id } = req.body;

    // Get current issue for history
    const currentIssue = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (currentIssue.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const oldIssue = currentIssue.rows[0];

    // Update issue
    const result = await pool.query(`
      UPDATE issues 
      SET status = $1, sprint_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, sprint_id, id]);

    // Log history if status changed
    if (status && status !== oldIssue.status) {
      await pool.query(`
        INSERT INTO issue_history (issue_id, user_id, field, old_value, new_value)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, user?.userId, 'status', oldIssue.status, status]);
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Move issue error:', error);
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
