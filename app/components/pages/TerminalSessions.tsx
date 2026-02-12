'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Plus, History, Clock, X, Play, FileText, Trash2, ArrowLeft } from 'lucide-react';
import { getToken } from '../../lib/auth';
import { motion } from 'framer-motion';
import ConfirmModal from '../core/ConfirmModal';

interface TerminalSession {
  id: number;
  session_id: string;
  user_id: number;
  name: string;
  status: 'active' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  command_count: number;
  last_activity: string | null;
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

export default function TerminalSessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteSessionId, setConfirmDeleteSessionId] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/sessions`;
      
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions || []);
      } else {
        setError(data.error || 'Failed to load sessions');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteSession = (sessionId: string) => {
    setConfirmDeleteSessionId(sessionId);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!confirmDeleteSessionId) return;

    setDeletingSession(true);
    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/sessions/${confirmDeleteSessionId}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      await fetchSessions();
      setConfirmDeleteOpen(false);
      setConfirmDeleteSessionId(null);
    } catch (err) {
      console.error('Failed to delete session');
    } finally {
      setDeletingSession(false);
    }
  };

  const createSession = async () => {
    setCreating(true);
    setError('');
    
    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/sessions`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newSessionName || undefined })
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/terminal/${data.session.session_id}`);
      } else {
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      setError('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/terminal/sessions/${sessionId}/close`;
      
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      fetchSessions();
    } catch (err) {
      console.error('Failed to close session');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Delete terminal session?"
        description="This will also delete its command logs."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        loading={deletingSession}
        onConfirm={confirmDeleteSession}
        onClose={() => {
          if (deletingSession) return;
          setConfirmDeleteOpen(false);
          setConfirmDeleteSessionId(null);
        }}
      />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <BackButton />
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Terminal Sessions</h1>
                <p className="text-slate-300 text-sm">Manage your terminal workspaces</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Terminal
            </button>
          </div>

          {/* Create Session Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-slate-200"
            >
              <div className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Create New Terminal Session</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Session name (optional)"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={createSession}
                    disabled={creating}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Terminal Sessions</h3>
            <p className="text-slate-500 mb-6">Create your first terminal session to start executing commands</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Start New Terminal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      session.status === 'active' ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      <Terminal className={`w-6 h-6 ${
                        session.status === 'active' ? 'text-green-600' : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{session.name}</h3>
                      <p className="text-sm text-slate-500 font-mono">{session.session_id}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {session.command_count} commands
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.last_activity ? formatDate(session.last_activity) : formatDate(session.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {session.status === 'active' ? (
                      <>
                        <button
                          onClick={() => router.push(`/terminal/${session.session_id}`)}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Open
                        </button>
                        <button
                          onClick={() => closeSession(session.session_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Close Terminal"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => requestDeleteSession(session.session_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Terminal"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push(`/terminal/${session.session_id}`)}
                          className="flex items-center gap-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View Logs
                        </button>
                        <button
                          onClick={() => requestDeleteSession(session.session_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Terminal"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
