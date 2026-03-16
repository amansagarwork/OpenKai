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
  getCalendar,
  getBurndownData,
  getVelocityData,
  getSubtasks,
  getTimeEntries,
  startTimer,
  stopTimer,
  logTime,
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  getWatchers,
  addWatcher,
  removeWatcher,
  getIssueLinks,
  createIssueLink,
  deleteIssueLink,
  getCustomFields,
  createCustomField,
  deleteCustomField,
  getWorkflowTransitions,
  createWorkflowTransition,
  validateTransition,
  bulkUpdateIssues,
  bulkMoveToSprint,
  bulkCloseIssues,
  exportIssues,
  importIssues,
  getSprintReport
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

// Subtasks
router.get('/issues/:id/subtasks', getSubtasks);

// Time tracking
router.get('/issues/:id/time', getTimeEntries);
router.post('/issues/:id/timer/start', startTimer);
router.post('/issues/:id/timer/stop', stopTimer);
router.post('/issues/:id/time/log', logTime);

// Attachments
router.get('/issues/:id/attachments', getAttachments);
router.post('/issues/:id/attachments', uploadAttachment);
router.delete('/issues/:id/attachments/:attachmentId', deleteAttachment);

// Watchers
router.get('/issues/:id/watchers', getWatchers);
router.post('/issues/:id/watchers', addWatcher);
router.delete('/issues/:id/watchers', removeWatcher);

// Issue Links
router.get('/issues/:id/links', getIssueLinks);
router.post('/issues/:id/links', createIssueLink);
router.delete('/issues/:id/links/:linkId', deleteIssueLink);

// Custom Fields
router.get('/custom-fields', getCustomFields);
router.post('/custom-fields', createCustomField);
router.delete('/custom-fields/:id', deleteCustomField);

// Workflow Transitions
router.get('/workflow-transitions', getWorkflowTransitions);
router.post('/workflow-transitions', createWorkflowTransition);
router.post('/issues/:id/validate-transition', validateTransition);

// Bulk Operations
router.post('/issues/bulk/update', bulkUpdateIssues);
router.post('/issues/bulk/move-to-sprint', bulkMoveToSprint);
router.post('/issues/bulk/close', bulkCloseIssues);

// Import/Export
router.get('/issues/export', exportIssues);
router.post('/issues/import', importIssues);

// Comments
router.post('/issues/:id/comments', addComment);

// Reports
router.get('/reports', getReports);

// Burndown chart
router.get('/burndown', getBurndownData);

// Velocity chart
router.get('/velocity', getVelocityData);

// Sprint Report
router.get('/sprints/:id/report', getSprintReport);

export default router;
