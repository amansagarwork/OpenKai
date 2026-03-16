import { Request, Response } from 'express';
import pool from '../config/db';
import { IssueComment } from '../models/IssueComment';
import { Issue } from '../models/Issue';
import { Sprint } from '../models/Sprint';
import { IssueHistory } from '../models/IssueHistory';
import { User } from '../models/User';
import { TimeEntry } from '../models/TimeEntry';
import { Attachment } from '../models/Attachment';
import { IssueWatcher } from '../models/IssueWatcher';
import { IssueLink } from '../models/IssueLink';
import { CustomField } from '../models/CustomField';
import { WorkflowTransition } from '../models/WorkflowTransition';

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

    // Build match conditions
    const matchConditions: any = {};

    if (status) {
      matchConditions.status = status;
    }

    if (sprint_id) {
      matchConditions.sprint_id = sprint_id;
    }

    if (assignee_id) {
      matchConditions.assignee_id = assignee_id;
    }

    if (type) {
      matchConditions.type = type;
    }

    if (search) {
      matchConditions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('[BACKEND] Match conditions:', matchConditions);

    const issues = await Issue.find(matchConditions)
      .populate('assignee_id', 'username')
      .populate('reporter_id', 'username')
      .populate('sprint_id', 'name')
      .sort({ created_at: -1 });

    console.log('[BACKEND] Issues found:', issues.length);
    console.log('[BACKEND] Issues with due dates:', issues.filter((i: any) => i.due_date).length);
    console.log('[BACKEND] Sample issues:', issues.slice(0, 3).map((i: any) => ({
      id: i._id,
      key: i.key,
      title: i.title,
      status: i.status,
      due_date: i.due_date
    })));

    res.status(200).json(issues);
  } catch (error) {
    console.error('[BACKEND] Get issues error:', error);
    res.status(500).json({ error: 'Failed to get issues' });
  }
};

// Get single issue by ID
export const getIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('assignee_id', 'username')
      .populate('reporter_id', 'username')
      .populate('sprint_id', 'name');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Get comments
    const comments = await IssueComment.find({ issue_id: id })
      .populate('user_id', 'username')
      .sort({ created_at: 1 });

    // Get history
    const history = await IssueHistory.find({ issue_id: id })
      .populate('user_id', 'username')
      .sort({ created_at: -1 });

    const issueObj = issue.toObject();
    const response = {
      ...issueObj,
      id: issueObj._id.toString(),
      assignee_name: (issueObj.assignee_id as any)?.username,
      reporter_name: (issueObj.reporter_id as any)?.username,
      sprint_name: (issueObj.sprint_id as any)?.name,
      comments: comments.map(c => ({
        ...c.toObject(),
        id: c._id.toString(),
        user_name: c.user_id ? (c.user_id as any).username : 'Unknown'
      })),
      history: history.map(h => ({
        ...h.toObject(),
        id: h._id.toString(),
        user_name: h.user_id ? (h.user_id as any).username : 'Unknown'
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to get issue' });
  }
};

// Create new issue
export const createIssue = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
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

    // Convert assignee name to ObjectId if provided
    let assignee_id = null;
    if (assignee && typeof assignee === 'string') {
      try {
        const userDoc = await User.findOne({ username: assignee });
        if (userDoc) {
          assignee_id = userDoc._id;
        }
      } catch (error) {
        console.log('[BACKEND] Could not find user for assignee:', assignee);
      }
    }

    // Generate issue key
    const count = await Issue.countDocuments({ key: { $regex: /^PROD-/ } });
    const key = `PROD-${count + 1}`;

    const newIssue = new Issue({
      key,
      title,
      description,
      type,
      priority,
      status,
      assignee_id,
      reporter_id: user?.userId,
      sprint_id: sprint_id || null,
      parent_id: parent_id || null,
      story_points: story_points ? parseInt(story_points) : null,
      labels,
      due_date: due_date || null,
      estimated_hours: estimated_hours ? parseFloat(estimated_hours) : null,
      actual_hours: actual_hours ? parseFloat(actual_hours) : null,
    });

    const savedIssue = await newIssue.save();

    console.log('[BACKEND] Issue created successfully:', savedIssue);
    res.status(201).json(savedIssue);
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

    // Build match conditions
    const matchConditions: any = {};

    if (sprint_id) {
      matchConditions.sprint_id = sprint_id;
    } else {
      // Default to active sprint or backlog (issues without sprint or in active sprint)
      matchConditions.$or = [
        { sprint_id: null },
        { sprint_id: { $in: await Sprint.find({ state: 'active' }).distinct('_id') } }
      ];
    }

    console.log('[BACKEND] Match conditions:', matchConditions);

    // Get issues with populated fields
    const issues = await Issue.find(matchConditions)
      .populate('assignee_id', 'username')
      .populate('reporter_id', 'username')
      .populate('sprint_id', 'name')
      .sort({ updated_at: -1 });

    console.log(`[BACKEND] Found ${issues.length} issues`);
    console.log('[BACKEND] Issues with due dates:', issues.filter(i => i.due_date).length);

    // Group by status and transform to include id field
    const transformIssue = (issue: any) => {
      const obj = issue.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        assignee_name: obj.assignee_id?.username,
        reporter_name: obj.reporter_id?.username,
        sprint_name: obj.sprint_id?.name
      };
    };

    const transformedIssues = issues.map(transformIssue);

    console.log('[BACKEND] Sample board issues:', transformedIssues.slice(0, 3).map(i => ({
      id: i.id,
      key: i.key,
      title: i.title,
      status: i.status,
      due_date: i.due_date,
      assignee_name: i.assignee_name
    })));

    const board = {
      backlog: transformedIssues.filter((i: any) => i.status === 'backlog'),
      selected: transformedIssues.filter((i: any) => i.status === 'selected'),
      'in-progress': transformedIssues.filter((i: any) => i.status === 'in-progress'),
      done: transformedIssues.filter((i: any) => i.status === 'done')
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
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;
    const { status, sprint_id } = req.body;

    console.log(`[BACKEND] Move request: issue=${id}, status=${status}, sprint_id=${sprint_id}`);

    // Get current issue for history
    const currentIssue = await Issue.findById(id);
    if (!currentIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const oldIssue = currentIssue;
    console.log(`[BACKEND] Current issue:`, oldIssue);

    // Update issue
    const updateData: any = {
      status,
      updated_at: new Date()
    };

    if (sprint_id !== undefined) {
      updateData.sprint_id = sprint_id;
    }

    console.log(`[BACKEND] Updating to:`, updateData);

    const updatedIssue = await Issue.findByIdAndUpdate(id, updateData, { new: true });

    console.log(`[BACKEND] Update result:`, updatedIssue);

    // Log history if status changed
    if (status && status !== oldIssue.status && user?.userId) {
      await IssueHistory.create({
        issue_id: id,
        user_id: user.userId,
        field: 'status',
        old_value: oldIssue.status,
        new_value: status
      });
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('[BACKEND] Move issue error:', error);
    res.status(500).json({ error: 'Failed to move issue' });
  }
};

// Add comment to issue
export const addComment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify issue exists
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const newComment = new IssueComment({
      issue_id: id,
      user_id: user?.userId,
      content
    });

    const savedComment = await newComment.save();

    // Populate user info for response
    await savedComment.populate('user_id', 'username');

    const commentObj = savedComment.toObject();
    const response = {
      ...commentObj,
      id: commentObj._id.toString(),
      user_name: commentObj.user_id ? (commentObj.user_id as any).username : 'Unknown'
    };

    res.status(201).json(response);
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
    
    result.rows.forEach((issue: any) => {
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

// Get burndown chart data for a sprint
export const getBurndownData = async (req: Request, res: Response) => {
  try {
    const { sprint_id } = req.query;

    if (!sprint_id) {
      return res.status(400).json({ error: 'Sprint ID is required' });
    }

    // Get sprint info
    const sprint = await Sprint.findById(sprint_id);
    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    // Get all issues for this sprint
    const issues = await Issue.find({ sprint_id }).select('story_points status created_at updated_at');

    // Calculate total story points
    const totalPoints = issues.reduce((sum, issue) => sum + (issue.story_points || 0), 0);

    // For now, create a simple burndown simulation
    // In a real implementation, you'd track daily remaining points
    const startDate = sprint.start_date ? new Date(sprint.start_date) : new Date();
    const endDate = sprint.end_date ? new Date(sprint.end_date) : new Date();
    const today = new Date();

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const burndownData = [];

    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      if (date > today) break; // Don't show future data

      // Calculate remaining points (simplified - in reality you'd track historical data)
      const completedPoints = issues
        .filter(issue => issue.status === 'done' && new Date(issue.updated_at) <= date)
        .reduce((sum, issue) => sum + (issue.story_points || 0), 0);

      const remaining = Math.max(0, totalPoints - completedPoints);
      const ideal = totalPoints - (totalPoints / daysDiff) * i;

      burndownData.push({
        date: date.toISOString().split('T')[0],
        remaining: Math.max(0, remaining),
        ideal: Math.max(0, ideal),
        completed: completedPoints
      });
    }

    res.status(200).json({
      sprint: {
        id: sprint._id.toString(),
        name: sprint.name,
        start_date: sprint.start_date,
        end_date: sprint.end_date
      },
      total_points: totalPoints,
      burndown: burndownData
    });
  } catch (error) {
    console.error('[BACKEND] Get burndown data error:', error);
    res.status(500).json({ error: 'Failed to get burndown data' });
  }
};

// Get reports data
export const getReports = async (req: Request, res: Response) => {
  try {
    // Get counts by status
    const statusCounts = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get counts by priority
    const priorityCounts = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get active sprint info
    const activeSprint = await Sprint.findOne({ state: 'active' });
    
    // Get sprint stats if there's an active sprint
    let sprintStats = null;
    if (activeSprint) {
      const sprintIssues = await Issue.find({ sprint_id: activeSprint._id });
      const totalPoints = sprintIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0);
      const completedPoints = sprintIssues
        .filter(i => i.status === 'done')
        .reduce((sum, issue) => sum + (issue.story_points || 0), 0);
      
      sprintStats = {
        sprint_id: activeSprint._id.toString(),
        sprint_name: activeSprint.name,
        total_issues: sprintIssues.length,
        completed_issues: sprintIssues.filter(i => i.status === 'done').length,
        total_points: totalPoints,
        completed_points: completedPoints,
        completion_percentage: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
      };
    }

    res.status(200).json({
      status_counts: statusCounts.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      priority_counts: priorityCounts.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      sprint_stats: sprintStats,
      total_issues: await Issue.countDocuments()
    });
  } catch (error) {
    console.error('[BACKEND] Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
};

// Get subtasks for an issue
export const getSubtasks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify parent issue exists
    const parentIssue = await Issue.findById(id);
    if (!parentIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Get all subtasks
    const subtasks = await Issue.find({ parent_id: id })
      .populate('assignee_id', 'username')
      .populate('reporter_id', 'username')
      .sort({ created_at: -1 });

    const transformedSubtasks = subtasks.map(issue => {
      const obj = issue.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        assignee_name: (obj.assignee_id as any)?.username,
        reporter_name: (obj.reporter_id as any)?.username
      };
    });

    // Calculate progress stats
    const total = subtasks.length;
    const done = subtasks.filter(i => i.status === 'done').length;
    const inProgress = subtasks.filter(i => i.status === 'in-progress').length;
    const totalPoints = subtasks.reduce((sum, i) => sum + (i.story_points || 0), 0);
    const completedPoints = subtasks
      .filter(i => i.status === 'done')
      .reduce((sum, i) => sum + (i.story_points || 0), 0);

    res.status(200).json({
      subtasks: transformedSubtasks,
      stats: {
        total,
        done,
        in_progress: inProgress,
        total_points: totalPoints,
        completed_points: completedPoints,
        completion_percentage: total > 0 ? Math.round((done / total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('[BACKEND] Get subtasks error:', error);
    res.status(500).json({ error: 'Failed to get subtasks' });
  }
};

// Get velocity chart data for all closed sprints
export const getVelocityData = async (req: Request, res: Response) => {
  try {
    // Get all closed sprints with their completed story points
    const velocityData = await Sprint.aggregate([
      {
        $match: { state: 'closed' }
      },
      {
        $lookup: {
          from: 'issues',
          localField: '_id',
          foreignField: 'sprint_id',
          as: 'issues'
        }
      },
      {
        $addFields: {
          completed_points: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$issues',
                    cond: { $eq: ['$$this.status', 'done'] }
                  }
                },
                as: 'issue',
                in: '$$issue.story_points'
              }
            }
          },
          total_issues: { $size: '$issues' },
          completed_issues: {
            $size: {
              $filter: {
                input: '$issues',
                cond: { $eq: ['$$this.status', 'done'] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          completed_points: 1,
          total_issues: 1,
          completed_issues: 1,
          end_date: 1
        }
      },
      {
        $sort: { end_date: 1 }
      }
    ]);

    res.status(200).json({
      velocity: velocityData.map(item => ({
        ...item,
        id: item.id.toString()
      }))
    });
  } catch (error) {
    console.error('[BACKEND] Get velocity data error:', error);
    res.status(500).json({ error: 'Failed to get velocity data' });
  }
};

// Get time entries for an issue
export const getTimeEntries = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entries = await TimeEntry.find({ issue_id: id })
      .populate('user_id', 'username')
      .sort({ created_at: -1 });

    const totalMinutes = entries
      .filter(e => !e.is_running)
      .reduce((sum, e) => sum + e.duration_minutes, 0);

    const runningEntry = entries.find(e => e.is_running);

    res.status(200).json({
      entries: entries.map(e => ({
        ...e.toObject(),
        id: e._id.toString(),
        user_name: (e.user_id as any)?.username || 'Unknown'
      })),
      total_minutes: totalMinutes,
      total_hours: Math.round((totalMinutes / 60) * 10) / 10,
      running_entry: runningEntry ? {
        id: runningEntry._id.toString(),
        started_at: runningEntry.started_at,
        duration_minutes: runningEntry.duration_minutes
      } : null
    });
  } catch (error) {
    console.error('[BACKEND] Get time entries error:', error);
    res.status(500).json({ error: 'Failed to get time entries' });
  }
};

// Start timer
export const startTimer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;

    // Check for existing running timer
    const existingRunning = await TimeEntry.findOne({ user_id: user?.userId, is_running: true });
    if (existingRunning) {
      return res.status(400).json({ error: 'Timer already running for another issue' });
    }

    const entry = new TimeEntry({
      issue_id: id,
      user_id: user?.userId,
      started_at: new Date(),
      is_running: true,
      duration_minutes: 0
    });

    await entry.save();
    res.status(201).json({ id: entry._id.toString(), started_at: entry.started_at });
  } catch (error) {
    console.error('[BACKEND] Start timer error:', error);
    res.status(500).json({ error: 'Failed to start timer' });
  }
};

// Stop timer
export const stopTimer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;

    const entry = await TimeEntry.findOne({ issue_id: id, user_id: user?.userId, is_running: true });
    if (!entry) {
      return res.status(404).json({ error: 'No running timer found' });
    }

    const endedAt = new Date();
    const startedAt = entry.started_at || endedAt;
    const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / (1000 * 60));

    entry.is_running = false;
    entry.ended_at = endedAt;
    entry.duration_minutes = durationMinutes;
    await entry.save();

    // Update issue actual_hours
    await Issue.findByIdAndUpdate(id, {
      $inc: { actual_hours: durationMinutes / 60 }
    });

    res.status(200).json({ duration_minutes: durationMinutes });
  } catch (error) {
    console.error('[BACKEND] Stop timer error:', error);
    res.status(500).json({ error: 'Failed to stop timer' });
  }
};

// Log manual time entry
export const logTime = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;
    const { duration_minutes, description, date } = req.body;

    if (!duration_minutes || duration_minutes <= 0) {
      return res.status(400).json({ error: 'Duration is required' });
    }

    const entry = new TimeEntry({
      issue_id: id,
      user_id: user?.userId,
      duration_minutes,
      description,
      started_at: date ? new Date(date) : new Date(),
      ended_at: date ? new Date(date) : new Date(),
      is_running: false
    });

    await entry.save();

    // Update issue actual_hours
    await Issue.findByIdAndUpdate(id, {
      $inc: { actual_hours: duration_minutes / 60 }
    });

    res.status(201).json({ id: entry._id.toString() });
  } catch (error) {
    console.error('[BACKEND] Log time error:', error);
    res.status(500).json({ error: 'Failed to log time' });
  }
};

// Get attachments for an issue
export const getAttachments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const attachments = await Attachment.find({ issue_id: id })
      .populate('user_id', 'username')
      .sort({ created_at: -1 });

    res.status(200).json({
      attachments: attachments.map(a => ({
        ...a.toObject(),
        id: a._id.toString(),
        user_name: (a.user_id as any)?.username || 'Unknown'
      }))
    });
  } catch (error) {
    console.error('[BACKEND] Get attachments error:', error);
    res.status(500).json({ error: 'Failed to get attachments' });
  }
};

// Upload attachment endpoint
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(201).json({ 
      message: 'Attachment endpoint ready - requires file upload middleware',
      issue_id: id 
    });
  } catch (error) {
    console.error('[BACKEND] Upload attachment error:', error);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
};

// Delete attachment
export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id, attachmentId } = req.params;

    const attachment = await Attachment.findOne({ _id: attachmentId, issue_id: id });
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    await Attachment.deleteOne({ _id: attachmentId });
    res.status(200).json({ message: 'Attachment deleted' });
  } catch (error) {
    console.error('[BACKEND] Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

// Get watchers for an issue
export const getWatchers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const watchers = await IssueWatcher.find({ issue_id: id })
      .populate('user_id', 'username email')
      .sort({ created_at: -1 });

    res.status(200).json({
      watchers: watchers.map(w => ({
        id: w._id.toString(),
        user_id: (w.user_id as any)?._id?.toString(),
        user_name: (w.user_id as any)?.username || 'Unknown',
        email: (w.user_id as any)?.email,
        created_at: w.created_at
      }))
    });
  } catch (error) {
    console.error('[BACKEND] Get watchers error:', error);
    res.status(500).json({ error: 'Failed to get watchers' });
  }
};

// Add watcher to issue
export const addWatcher = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;

    // Check if issue exists
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if already watching
    const existing = await IssueWatcher.findOne({ issue_id: id, user_id: user?.userId });
    if (existing) {
      return res.status(400).json({ error: 'Already watching this issue' });
    }

    const watcher = new IssueWatcher({
      issue_id: id,
      user_id: user?.userId
    });

    await watcher.save();
    res.status(201).json({ id: watcher._id.toString(), message: 'Now watching issue' });
  } catch (error) {
    console.error('[BACKEND] Add watcher error:', error);
    res.status(500).json({ error: 'Failed to add watcher' });
  }
};

// Remove watcher from issue
export const removeWatcher = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;

    const result = await IssueWatcher.deleteOne({ issue_id: id, user_id: user?.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not watching this issue' });
    }

    res.status(200).json({ message: 'Stopped watching issue' });
  } catch (error) {
    console.error('[BACKEND] Remove watcher error:', error);
    res.status(500).json({ error: 'Failed to remove watcher' });
  }
};

// Get linked issues for an issue
export const getIssueLinks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get all links where this issue is either source or target
    const [outgoingLinks, incomingLinks] = await Promise.all([
      IssueLink.find({ source_issue_id: id })
        .populate('target_issue_id', 'key title status type priority')
        .populate('created_by', 'username'),
      IssueLink.find({ target_issue_id: id })
        .populate('source_issue_id', 'key title status type priority')
        .populate('created_by', 'username')
    ]);

    const transformLink = (link: any, direction: 'outgoing' | 'incoming') => {
      const issue = direction === 'outgoing' ? link.target_issue_id : link.source_issue_id;
      return {
        id: link._id.toString(),
        link_type: link.link_type,
        direction,
        issue: issue ? {
          id: issue._id.toString(),
          key: issue.key,
          title: issue.title,
          status: issue.status,
          type: issue.type,
          priority: issue.priority
        } : null,
        created_by: (link.created_by as any)?.username || 'Unknown',
        created_at: link.created_at
      };
    };

    res.status(200).json({
      links: [
        ...outgoingLinks.map(l => transformLink(l, 'outgoing')),
        ...incomingLinks.map(l => transformLink(l, 'incoming'))
      ]
    });
  } catch (error) {
    console.error('[BACKEND] Get issue links error:', error);
    res.status(500).json({ error: 'Failed to get issue links' });
  }
};

// Create issue link
export const createIssueLink = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { id } = req.params;
    const { target_issue_id, link_type } = req.body;

    if (!target_issue_id || !link_type) {
      return res.status(400).json({ error: 'Target issue ID and link type are required' });
    }

    // Verify source issue exists
    const sourceIssue = await Issue.findById(id);
    if (!sourceIssue) {
      return res.status(404).json({ error: 'Source issue not found' });
    }

    // Verify target issue exists
    const targetIssue = await Issue.findById(target_issue_id);
    if (!targetIssue) {
      return res.status(404).json({ error: 'Target issue not found' });
    }

    // Prevent linking to self
    if (id === target_issue_id) {
      return res.status(400).json({ error: 'Cannot link an issue to itself' });
    }

    // Create the link
    const link = new IssueLink({
      source_issue_id: id,
      target_issue_id,
      link_type,
      created_by: user?.userId
    });

    await link.save();

    // Create inverse link for bidirectional relationships
    const inverseTypes: Record<string, string> = {
      'blocks': 'blocked_by',
      'blocked_by': 'blocks',
      'duplicates': 'duplicated_by',
      'duplicated_by': 'duplicates'
    };

    if (inverseTypes[link_type]) {
      try {
        await IssueLink.create({
          source_issue_id: target_issue_id,
          target_issue_id: id,
          link_type: inverseTypes[link_type],
          created_by: user?.userId
        });
      } catch (e) {
        // Inverse may already exist, ignore
      }
    }

    res.status(201).json({ id: link._id.toString(), message: 'Issue link created' });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Link already exists' });
    }
    console.error('[BACKEND] Create issue link error:', error);
    res.status(500).json({ error: 'Failed to create issue link' });
  }
};

// Delete issue link
export const deleteIssueLink = async (req: Request, res: Response) => {
  try {
    const { id, linkId } = req.params;

    const link = await IssueLink.findOne({ _id: linkId, source_issue_id: id });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Delete the link
    await IssueLink.deleteOne({ _id: linkId });

    // Delete inverse link if exists
    const inverseTypes: Record<string, string> = {
      'blocks': 'blocked_by',
      'blocked_by': 'blocks',
      'duplicates': 'duplicated_by',
      'duplicated_by': 'duplicates'
    };

    if (inverseTypes[link.link_type]) {
      await IssueLink.deleteOne({
        source_issue_id: link.target_issue_id,
        target_issue_id: id,
        link_type: inverseTypes[link.link_type]
      });
    }

    res.status(200).json({ message: 'Issue link deleted' });
  } catch (error) {
    console.error('[BACKEND] Delete issue link error:', error);
    res.status(500).json({ error: 'Failed to delete issue link' });
  }
};

// Get all custom fields
export const getCustomFields = async (req: Request, res: Response) => {
  try {
    const fields = await CustomField.find().sort({ created_at: -1 });
    res.status(200).json({
      fields: fields.map(f => ({
        ...f.toObject(),
        id: f._id.toString()
      }))
    });
  } catch (error) {
    console.error('[BACKEND] Get custom fields error:', error);
    res.status(500).json({ error: 'Failed to get custom fields' });
  }
};

// Create custom field
export const createCustomField = async (req: Request, res: Response) => {
  try {
    const { name, key, type, description, options, required, default_value } = req.body;

    if (!name || !key || !type) {
      return res.status(400).json({ error: 'Name, key, and type are required' });
    }

    // Validate key format (alphanumeric with underscores)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      return res.status(400).json({ error: 'Key must start with letter/underscore and contain only alphanumeric characters and underscores' });
    }

    const field = new CustomField({
      name,
      key: key.toLowerCase(),
      type,
      description,
      options,
      required: required || false,
      default_value
    });

    await field.save();
    res.status(201).json({ id: field._id.toString(), message: 'Custom field created' });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Custom field with this key already exists' });
    }
    console.error('[BACKEND] Create custom field error:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
};

// Delete custom field
export const deleteCustomField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CustomField.deleteOne({ _id: id });
    res.status(200).json({ message: 'Custom field deleted' });
  } catch (error) {
    console.error('[BACKEND] Delete custom field error:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
};

// Get all workflow transitions
export const getWorkflowTransitions = async (req: Request, res: Response) => {
  try {
    const transitions = await WorkflowTransition.find().sort({ from_status: 1, to_status: 1 });
    res.status(200).json({
      transitions: transitions.map(t => ({
        ...t.toObject(),
        id: t._id.toString()
      }))
    });
  } catch (error) {
    console.error('[BACKEND] Get workflow transitions error:', error);
    res.status(500).json({ error: 'Failed to get workflow transitions' });
  }
};

// Create workflow transition
export const createWorkflowTransition = async (req: Request, res: Response) => {
  try {
    const { from_status, to_status, require_assignee, require_estimate, allowed_types } = req.body;

    if (!from_status || !to_status) {
      return res.status(400).json({ error: 'From status and to status are required' });
    }

    if (from_status === to_status) {
      return res.status(400).json({ error: 'From and to status cannot be the same' });
    }

    const transition = new WorkflowTransition({
      from_status,
      to_status,
      require_assignee: require_assignee || false,
      require_estimate: require_estimate || false,
      allowed_types: allowed_types || []
    });

    await transition.save();
    res.status(201).json({ id: transition._id.toString(), message: 'Workflow transition created' });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Workflow transition already exists' });
    }
    console.error('[BACKEND] Create workflow transition error:', error);
    res.status(500).json({ error: 'Failed to create workflow transition' });
  }
};

// Validate workflow transition
export const validateTransition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { to_status } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const from_status = issue.status;

    // Check if transition exists
    const transition = await WorkflowTransition.findOne({ from_status, to_status });
    if (!transition) {
      return res.status(400).json({ 
        valid: false, 
        error: `Transition from ${from_status} to ${to_status} is not allowed` 
      });
    }

    // Check type restriction
    if (transition.allowed_types.length > 0 && !transition.allowed_types.includes(issue.type)) {
      return res.status(400).json({ 
        valid: false, 
        error: `Transition not allowed for issue type ${issue.type}` 
      });
    }

    // Check assignee requirement
    if (transition.require_assignee && !issue.assignee_id) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Assignee is required for this transition' 
      });
    }

    // Check estimate requirement
    if (transition.require_estimate && (!issue.estimated_hours || issue.estimated_hours === 0)) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Time estimate is required for this transition' 
      });
    }

    res.status(200).json({ valid: true, message: 'Transition is valid' });
  } catch (error) {
    console.error('[BACKEND] Validate transition error:', error);
    res.status(500).json({ error: 'Failed to validate transition' });
  }
};

// Bulk update issues
export const bulkUpdateIssues = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { issue_ids, updates } = req.body;

    if (!issue_ids || !Array.isArray(issue_ids) || issue_ids.length === 0) {
      return res.status(400).json({ error: 'Issue IDs array is required' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Updates object is required' });
    }

    const allowedFields = ['status', 'assignee_id', 'sprint_id', 'priority', 'labels'];
    const updateKeys = Object.keys(updates);
    const invalidFields = updateKeys.filter(k => !allowedFields.includes(k));

    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
    }

    // Update all issues
    const result = await Issue.updateMany(
      { _id: { $in: issue_ids } },
      { $set: updates, updated_at: new Date() }
    );

    // Log history for status changes
    if (updates.status) {
      for (const issueId of issue_ids) {
        await IssueHistory.create({
          issue_id: issueId,
          user_id: user?.userId,
          field: 'status',
          old_value: 'bulk',
          new_value: updates.status
        });
      }
    }

    res.status(200).json({ 
      message: 'Bulk update completed',
      modified_count: result.modifiedCount 
    });
  } catch (error) {
    console.error('[BACKEND] Bulk update error:', error);
    res.status(500).json({ error: 'Failed to bulk update issues' });
  }
};

// Bulk move issues to sprint
export const bulkMoveToSprint = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { issue_ids, sprint_id } = req.body;

    if (!issue_ids || !Array.isArray(issue_ids) || issue_ids.length === 0) {
      return res.status(400).json({ error: 'Issue IDs array is required' });
    }

    // Verify sprint exists
    if (sprint_id) {
      const sprint = await Sprint.findById(sprint_id);
      if (!sprint) {
        return res.status(404).json({ error: 'Sprint not found' });
      }
    }

    const result = await Issue.updateMany(
      { _id: { $in: issue_ids } },
      { $set: { sprint_id: sprint_id || null, updated_at: new Date() } }
    );

    res.status(200).json({ 
      message: 'Bulk move to sprint completed',
      modified_count: result.modifiedCount 
    });
  } catch (error) {
    console.error('[BACKEND] Bulk move error:', error);
    res.status(500).json({ error: 'Failed to bulk move issues' });
  }
};

// Bulk close issues
export const bulkCloseIssues = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { issue_ids } = req.body;

    if (!issue_ids || !Array.isArray(issue_ids) || issue_ids.length === 0) {
      return res.status(400).json({ error: 'Issue IDs array is required' });
    }

    const result = await Issue.updateMany(
      { _id: { $in: issue_ids } },
      { 
        $set: { 
          status: 'done', 
          resolved_at: new Date(),
          updated_at: new Date() 
        } 
      }
    );

    // Log history for closed issues
    for (const issueId of issue_ids) {
      await IssueHistory.create({
        issue_id: issueId,
        user_id: user?.userId,
        field: 'status',
        old_value: 'bulk',
        new_value: 'done'
      });
    }

    res.status(200).json({ 
      message: 'Bulk close completed',
      modified_count: result.modifiedCount 
    });
  } catch (error) {
    console.error('[BACKEND] Bulk close error:', error);
    res.status(500).json({ error: 'Failed to bulk close issues' });
  }
};

// Export issues to JSON/CSV
export const exportIssues = async (req: Request, res: Response) => {
  try {
    const { format = 'json', sprint_id, status } = req.query;

    // Build query
    const query: any = {};
    if (sprint_id) query.sprint_id = sprint_id;
    if (status) query.status = status;

    const issues = await Issue.find(query)
      .populate('assignee_id', 'username')
      .populate('reporter_id', 'username')
      .populate('sprint_id', 'name')
      .sort({ created_at: -1 });

    const exportData = issues.map(issue => {
      const obj = issue.toObject();
      return {
        key: obj.key,
        title: obj.title,
        description: obj.description,
        type: obj.type,
        priority: obj.priority,
        status: obj.status,
        assignee: (obj.assignee_id as any)?.username || null,
        reporter: (obj.reporter_id as any)?.username || null,
        sprint: (obj.sprint_id as any)?.name || null,
        story_points: obj.story_points,
        labels: obj.labels,
        estimated_hours: obj.estimated_hours,
        actual_hours: obj.actual_hours,
        due_date: obj.due_date,
        created_at: obj.created_at,
        updated_at: obj.updated_at,
        resolved_at: obj.resolved_at
      };
    });

    if (format === 'csv') {
      // Simple CSV conversion
      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map(obj => 
        Object.values(obj).map(v => 
          typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=issues.csv');
      return res.send(csv);
    }

    // Default JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=issues.json');
    res.status(200).json({ issues: exportData, exported_at: new Date() });
  } catch (error) {
    console.error('[BACKEND] Export issues error:', error);
    res.status(500).json({ error: 'Failed to export issues' });
  }
};

// Import issues from JSON
export const importIssues = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    const { issues } = req.body;

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return res.status(400).json({ error: 'Issues array is required' });
    }

    const results = {
      created: 0,
      errors: [] as string[]
    };

    for (const issueData of issues) {
      try {
        // Generate issue key
        const count = await Issue.countDocuments({ key: { $regex: /^PROD-/ } });
        const key = `PROD-${count + 1}`;

        const newIssue = new Issue({
          key,
          title: issueData.title,
          description: issueData.description,
          type: issueData.type || 'task',
          priority: issueData.priority || 'medium',
          status: issueData.status || 'backlog',
          story_points: issueData.story_points,
          labels: issueData.labels || [],
          estimated_hours: issueData.estimated_hours,
          actual_hours: issueData.actual_hours,
          due_date: issueData.due_date,
          reporter_id: user?.userId,
          sprint_id: issueData.sprint_id || null
        });

        await newIssue.save();
        results.created++;
      } catch (e: any) {
        results.errors.push(`Failed to import "${issueData.title}": ${e.message}`);
      }
    }

    res.status(201).json({ 
      message: 'Import completed',
      created: results.created,
      errors: results.errors
    });
  } catch (error) {
    console.error('[BACKEND] Import issues error:', error);
    res.status(500).json({ error: 'Failed to import issues' });
  }
};

// Get sprint completion report
export const getSprintReport = async (req: Request, res: Response) => {
  try {
    const { sprint_id } = req.query;

    if (!sprint_id) {
      return res.status(400).json({ error: 'Sprint ID is required' });
    }

    const sprint = await Sprint.findById(sprint_id);
    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    const issues = await Issue.find({ sprint_id });

    const totalIssues = issues.length;
    const completedIssues = issues.filter(i => i.status === 'done').length;
    const inProgressIssues = issues.filter(i => i.status === 'in-progress').length;
    const backlogIssues = issues.filter(i => i.status === 'backlog' || i.status === 'selected').length;

    const totalPoints = issues.reduce((sum, i) => sum + (i.story_points || 0), 0);
    const completedPoints = issues.filter(i => i.status === 'done').reduce((sum, i) => sum + (i.story_points || 0), 0);

    const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    const velocity = completedPoints;

    // Calculate days remaining
    const now = new Date();
    const endDate = sprint.end_date ? new Date(sprint.end_date) : now;
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    res.status(200).json({
      sprint: {
        id: sprint._id.toString(),
        name: sprint.name,
        goal: sprint.goal,
        state: sprint.state,
        start_date: sprint.start_date,
        end_date: sprint.end_date
      },
      summary: {
        total_issues: totalIssues,
        completed_issues: completedIssues,
        in_progress_issues: inProgressIssues,
        backlog_issues: backlogIssues,
        completion_rate: completionRate,
        velocity: velocity,
        total_points: totalPoints,
        completed_points: completedPoints,
        remaining_points: totalPoints - completedPoints,
        days_remaining: daysRemaining
      },
      by_type: {
        story: issues.filter(i => i.type === 'story').length,
        task: issues.filter(i => i.type === 'task').length,
        bug: issues.filter(i => i.type === 'bug').length,
        epic: issues.filter(i => i.type === 'epic').length
      },
      by_priority: {
        highest: issues.filter(i => i.priority === 'highest').length,
        high: issues.filter(i => i.priority === 'high').length,
        medium: issues.filter(i => i.priority === 'medium').length,
        low: issues.filter(i => i.priority === 'low').length,
        lowest: issues.filter(i => i.priority === 'lowest').length
      }
    });
  } catch (error) {
    console.error('[BACKEND] Get sprint report error:', error);
    res.status(500).json({ error: 'Failed to get sprint report' });
  }
};
