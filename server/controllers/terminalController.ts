import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import { query } from '../config/db';

const execAsync = promisify(exec);

// Commands that are blocked for security (no admin/system access)
const BLOCKED_COMMANDS = [
  'sudo', 'su', 'chmod', 'chown', 'rm -rf /', 'del /f /s /q', 'format', 'diskpart',
  'regedit', 'powershell -ExecutionPolicy Bypass', 'powershell -ep bypass',
  'net user', 'net localgroup', 'net accounts', 'net share', 'sc ', 'services.msc',
  'taskkill /f /im', 'shutdown', 'restart', 'powercfg', 'bcdedit', 'fsutil',
  'vssadmin', 'wevtutil', 'takeown', 'icacls', 'cacls', 'attrib', 'rd /s /q',
  'rmdir /s /q', 'del /s /q', 'erase /s /q', 'rd /s', 'deltree', 'tskill',
  'ntrights', 'secedit', 'reg', 'regini', 'regsvr32', 'rundll32', 'msiexec',
  'sfc', 'dism', 'pkgmgr', 'ocsetup', 'servermanagercmd', 'wusa', 'expand',
  'makecab', 'extrac32', 'replace', 'recover', 'repair-bde', 'manage-bde',
  'cipher', 'convert', 'compact', 'defrag', 'chkdsk', 'chkntfs', 'bootcfg',
  'debug', 'edlin', 'debug.exe', 'edlin.exe', 'ed', 'ex', ':(){ :|:& };:',
  'fork bomb', '> /dev/null', '> nul', 'wget', 'curl', 'nc ', 'ncat', 'nmap',
  'masscan', 'zmap', 'hping', 'scapy', 'wireshark', 'tcpdump', 'ettercap',
  'metasploit', 'msfconsole', 'sqlmap', 'nikto', 'dirbuster', 'gobuster', 'burp',
  'owasp', 'hydra', 'john', 'hashcat', 'rainbowcrack', 'ophcrack', 'cain',
  'tshark', 'dumpcap', 'capinfos', 'mergecap', 'editcap', 'text2pcap',
  'randpkt', 'dftest', 'idl2wrs', 'bin/stat', 'sbin/', '/etc/', '/var/',
  '/root/', '/sys/', '/proc/', 'passwd', 'shadow', 'sudoers', '.ssh/',
  '.bash_history', 'history',
];

function isCommandSafe(command: string): { safe: boolean; reason?: string } {
  const lowerCmd = command.toLowerCase().trim();
  for (const blocked of BLOCKED_COMMANDS) {
    if (lowerCmd.includes(blocked.toLowerCase())) {
      return { safe: false, reason: `Command contains restricted keyword: "${blocked}"` };
    }
  }
  const dangerousPatterns = [
    /[;&|]\s*rm\s/, /[;&|]\s*del\s/, />\s*\/dev\/null/, />\s*nul/i,
    /`.*rm /, /\$\(.*rm /, /<\s*\(\)/, /\|\s*bash/i, /\|\s*sh\s/i,
    /wget\s.*\|/i, /curl\s.*\|/i,
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return { safe: false, reason: 'Command contains dangerous pattern' };
    }
  }
  return { safe: true };
}

// Create a new terminal session
export const createSession = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name } = req.body as { name?: string };
    const sessionId = nanoid(10); // Generate 10-char nanoid

    const result = await query(
      'INSERT INTO terminal_sessions (session_id, user_id, name, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [sessionId, user.userId, name || `Terminal-${sessionId.slice(0, 6)}`, 'active']
    );

    res.status(201).json({
      session: result.rows[0],
      message: 'Terminal session created',
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create terminal session' });
  }
};

// Get user's terminal sessions
export const getSessions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await query(
      `SELECT ts.*, 
        (SELECT COUNT(*) FROM terminal_commands WHERE session_id = ts.session_id) as command_count,
        (SELECT MAX(executed_at) FROM terminal_commands WHERE session_id = ts.session_id) as last_activity
      FROM terminal_sessions ts 
      WHERE ts.user_id = $1 
      ORDER BY ts.created_at DESC`,
      [user.userId]
    );

    res.status(200).json({ sessions: result.rows });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get terminal sessions' });
  }
};

// Get single session with commands
export const getSession = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { sessionId } = req.params;

    const sessionResult = await query(
      'SELECT * FROM terminal_sessions WHERE session_id = $1 AND user_id = $2',
      [sessionId, user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const commandsResult = await query(
      'SELECT * FROM terminal_commands WHERE session_id = $1 ORDER BY executed_at ASC',
      [sessionId]
    );

    res.status(200).json({
      session: sessionResult.rows[0],
      commands: commandsResult.rows,
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

// Close a terminal session
export const closeSession = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { sessionId } = req.params;

    await query(
      `UPDATE terminal_sessions 
       SET status = 'closed', closed_at = CURRENT_TIMESTAMP 
       WHERE session_id = $1 AND user_id = $2`,
      [sessionId, user.userId]
    );

    res.status(200).json({ message: 'Terminal session closed' });
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({ error: 'Failed to close session' });
  }
};

// Execute command in a session
export const executeCommand = async (req: Request, res: Response) => {
  try {
    const { command, workingDir, sessionId } = req.body as { command?: string; workingDir?: string; sessionId?: string };
    const user = (req as any).user as { userId: number; email: string; username: string } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Verify session belongs to user
    const sessionResult = await query(
      'SELECT * FROM terminal_sessions WHERE session_id = $1 AND user_id = $2',
      [sessionId, user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionResult.rows[0];
    if (session.status === 'closed') {
      return res.status(403).json({ error: 'Session is closed' });
    }

    const trimmedCommand = command.trim();
    if (!trimmedCommand) {
      return res.status(400).json({ error: 'Command cannot be empty' });
    }

    // Security check
    const safetyCheck = isCommandSafe(trimmedCommand);
    if (!safetyCheck.safe) {
      // Save blocked command attempt
      await query(
        `INSERT INTO terminal_commands (session_id, user_id, command, stdout, stderr, exit_code, working_directory) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sessionId, user.userId, trimmedCommand, '', `Blocked: ${safetyCheck.reason}`, 1, workingDir || process.cwd()]
      );

      return res.status(403).json({
        error: 'Command blocked for security reasons',
        reason: safetyCheck.reason,
        stdout: '',
        stderr: '',
        exitCode: 1,
      });
    }

    const safeWorkingDir = workingDir || process.cwd();
    if (safeWorkingDir.includes('..') || /[<>|&;`$]/.test(safeWorkingDir) || safeWorkingDir.includes('~')) {
      return res.status(403).json({
        error: 'Invalid working directory',
        stdout: '',
        stderr: '',
        exitCode: 1,
      });
    }

    const timeout = 30000;

    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    try {
      const result = await execAsync(trimmedCommand, {
        cwd: safeWorkingDir,
        timeout,
        windowsHide: true,
        env: { ...process.env, PATH: process.env.PATH, __COMPAT_LAYER: undefined },
      });
      stdout = result.stdout || '';
      stderr = result.stderr || '';
    } catch (error: any) {
      if (error.killed && error.signal === 'SIGTERM') {
        stderr = 'Command timed out (30s limit)';
        exitCode = 124;
      } else {
        stdout = error.stdout || '';
        stderr = error.stderr || error.message || 'Command failed';
        exitCode = error.code || 1;
      }
    }

    // Save command to database
    await query(
      `INSERT INTO terminal_commands (session_id, user_id, command, stdout, stderr, exit_code, working_directory) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, user.userId, trimmedCommand, stdout, stderr, exitCode, safeWorkingDir]
    );

    // Update session last activity
    await query(
      'UPDATE terminal_sessions SET updated_at = CURRENT_TIMESTAMP WHERE session_id = $1',
      [sessionId]
    );

    return res.status(200).json({
      stdout,
      stderr,
      exitCode,
      command: trimmedCommand,
    });

  } catch (error: any) {
    console.error('Execute command error:', error);
    return res.status(500).json({
      stdout: '',
      stderr: 'Internal server error',
      exitCode: 1,
      command: req.body?.command,
    });
  }
};

// Get allowed commands list
export const getAllowedCommands = async (_req: Request, res: Response) => {
  const ALLOWED_COMMANDS = [
    'dir', 'ls', 'cd', 'echo', 'type', 'cat', 'cls', 'clear', 'date', 'time',
    'ver', 'uname', 'hostname', 'whoami', 'pwd', 'tree', 'find', 'findstr',
    'grep', 'sort', 'more', 'less', 'head', 'tail', 'wc', 'copy', 'cp',
    'move', 'mv', 'rename', 'ren', 'del', 'rm', 'mkdir', 'md', 'rmdir', 'rd',
    'touch', 'set', 'env', 'path', 'help', 'python', 'python3', 'node',
    'npm', 'npx', 'git', 'code',
  ];

  res.status(200).json({
    allowed: ALLOWED_COMMANDS,
    note: 'These are common safe commands. Other commands may be allowed if they pass security checks.',
  });
};

// Get working directory info
export const getWorkingDirectory = async (req: Request, res: Response) => {
  const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.status(200).json({
    currentDir: process.cwd(),
    homeDir: process.env.HOME || process.env.USERPROFILE || process.cwd(),
  });
};
