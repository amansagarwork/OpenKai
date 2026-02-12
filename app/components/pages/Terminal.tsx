'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal as TerminalIcon, Send, HelpCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getToken } from '../../lib/auth';
import { motion } from 'framer-motion';

interface CommandHistory {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  timestamp: Date;
}

function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="flex items-center gap-2 px-4 py-2 mt-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="font-medium">Back</span>
    </button>
  );
}

export default function Terminal({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [workingDir, setWorkingDir] = useState('~');
  const [showHelp, setShowHelp] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'active' | 'closed'>('active');
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Load session data and history on mount
  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  // Auto-scroll to bottom on new history
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const loadSession = async () => {
    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/sessions/${sessionId}`;
      
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.status === 404) {
        router.push('/terminal');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setSessionName(data.session.name);
        setSessionStatus(data.session.status);
        // Convert DB commands to CommandHistory format
        const loadedHistory: CommandHistory[] = data.commands.map((cmd: any) => ({
          id: cmd.id.toString(),
          command: cmd.command,
          stdout: cmd.stdout || '',
          stderr: cmd.stderr || '',
          exitCode: cmd.exit_code,
          timestamp: new Date(cmd.executed_at),
        }));
        setHistory(loadedHistory);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const reopenSession = async () => {
    if (!sessionId) return;

    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/sessions/${sessionId}/reopen`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.ok) {
        setSessionStatus('active');
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Failed to reopen session:', error);
    }
  };

  const closeSession = async () => {
    if (!sessionId) return;
    
    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/sessions/${sessionId}/close`;
      
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSessionStatus('closed');
    } catch (error) {
      console.error('Failed to close session:', error);
    }
  };

  const executeCommand = async () => {
    if (!input.trim() || loading || !sessionId || sessionStatus === 'closed') return;

    const command = input.trim();
    setInput('');
    setLoading(true);

    const newEntry: CommandHistory = {
      id: Date.now().toString(),
      command,
      stdout: '',
      stderr: '',
      exitCode: 0,
      timestamp: new Date(),
    };

    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/execute`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ command, workingDir, sessionId }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      newEntry.stdout = data.stdout || '';
      newEntry.stderr = data.stderr || '';
      newEntry.exitCode = data.exitCode || 0;

      // Update working dir if cd command
      if (command.startsWith('cd ') && newEntry.exitCode === 0) {
        const newDir = command.slice(3).trim();
        setWorkingDir(newDir === '..' || newDir === '../' ? '~' : newDir);
      }
    } catch (error) {
      newEntry.stderr = error instanceof Error ? error.message : 'Failed to execute command';
      newEntry.exitCode = 1;
    } finally {
      setHistory(prev => [...prev, newEntry]);
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const commonCommands = [
    { cmd: 'dir', desc: 'List files (Windows)' },
    { cmd: 'ls', desc: 'List files (Unix)' },
    { cmd: 'pwd', desc: 'Show current directory' },
    { cmd: 'echo Hello', desc: 'Print text' },
    { cmd: 'cd ..', desc: 'Go up one directory' },
    { cmd: 'git status', desc: 'Check git status' },
    { cmd: 'node -v', desc: 'Check Node version' },
    { cmd: 'python -v', desc: 'Check Python version' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <BackButton />
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {sessionName || 'Terminal'}
                  {sessionId && (
                    <span className="text-sm font-normal text-slate-500 ml-2 font-mono">
                      {sessionId}
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${sessionStatus === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                  <span className={sessionStatus === 'active' ? 'text-green-600' : 'text-slate-500'}>
                    {sessionStatus === 'active' ? 'Active' : 'Closed'}
                  </span>
                  {sessionStatus === 'closed' && <span className="text-slate-400">• View-only mode</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sessionStatus === 'active' && sessionId && (
                <button
                  onClick={closeSession}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Close Terminal
                </button>
              )}
              {sessionStatus === 'closed' && sessionId && (
                <button
                  onClick={reopenSession}
                  className="px-3 py-2 text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Reopen Terminal
                </button>
              )}
              <button
                onClick={() => router.push('/terminal')}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Back to Sessions
              </button>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Help"
              >
                <HelpCircle className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <BackButton />
        {/* Help Panel */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Common Commands</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commonCommands.map(({ cmd, desc }) => (
                  <button
                    key={cmd}
                    onClick={() => {
                      setInput(cmd);
                      setShowHelp(false);
                      inputRef.current?.focus();
                    }}
                    className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <code className="text-slate-900 font-mono text-sm">{cmd}</code>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Commands requiring admin privileges are blocked for security. 
                  Dangerous commands like rm -rf, format, sudo, etc. are restricted.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Terminal Output */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-slate-400 font-mono">terminal — {workingDir}</span>
          </div>
          
          <div className="min-h-[300px] max-h-[50vh] overflow-y-auto font-mono text-sm p-4">
            {history.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <TerminalIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-slate-400">Welcome to the terminal!</p>
                <p className="text-xs mt-2 text-slate-500">Type a command and press Enter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="space-y-1">
                    {/* Command line */}
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="text-green-400">➜</span>
                      <span className="text-blue-400">{workingDir}</span>
                      <span className="text-white">{entry.command}</span>
                    </div>
                    
                    {/* Output */}
                    {entry.stdout && (
                      <pre className="text-slate-300 whitespace-pre-wrap pl-6">
                        {entry.stdout}
                      </pre>
                    )}
                    
                    {/* Error */}
                    {entry.stderr && (
                      <pre className="text-red-400 whitespace-pre-wrap pl-6">
                        {entry.stderr}
                      </pre>
                    )}
                    
                    {/* Exit code indicator */}
                    {entry.exitCode !== 0 && (
                      <div className="pl-6 text-xs text-red-500">
                        Exit code: {entry.exitCode}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={historyEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-4 bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-mono">
              <span className="text-green-500">➜</span>
              <span className="text-blue-500">{workingDir}</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type command..."
              disabled={loading || sessionStatus === 'closed'}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-700 font-mono text-sm disabled:opacity-50"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={executeCommand}
              disabled={loading || sessionStatus === 'closed' || !input.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Press Enter to execute • Dangerous commands are blocked for security
        </p>
      </div>
    </div>
  );
}
