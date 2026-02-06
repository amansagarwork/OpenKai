import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  executeCommand, 
  getAllowedCommands, 
  getWorkingDirectory,
  createSession,
  getSessions,
  getSession,
  closeSession
} from '../controllers/terminalController';

const router = Router();

// All terminal routes require authentication
router.use(requireAuth);

// Session management
router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId', getSession);
router.post('/sessions/:sessionId/close', closeSession);

// Execute a command
router.post('/execute', executeCommand);

// Get list of allowed commands
router.get('/commands', getAllowedCommands);

// Get current working directory info
router.get('/cwd', getWorkingDirectory);

export default router;
