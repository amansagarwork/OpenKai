import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
  getBoard,
  moveIssue,
  addComment,
  getReports,
  testDatabase,
  getCalendar
} from '../controllers/productManagementController';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Issues
router.get('/issues', getIssues);
router.get('/issues/:id', getIssue);
router.post('/issues', createIssue);
router.put('/issues/:id', updateIssue);
router.delete('/issues/:id', deleteIssue);

// Sprints
router.get('/sprints', getSprints);
router.post('/sprints', createSprint);
router.put('/sprints/:id', updateSprint);
router.delete('/sprints/:id', deleteSprint);

// Board
router.get('/board', getBoard);

// Calendar
router.get('/calendar', getCalendar);

// Move issue (drag and drop)
router.post('/issues/:id/move', moveIssue);

// Comments
router.post('/issues/:id/comments', addComment);

// Reports
router.get('/reports', getReports);

// Test database
router.get('/test', testDatabase);

export default router;
