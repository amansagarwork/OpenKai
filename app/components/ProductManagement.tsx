'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, AlertCircle, Target, GitBranch, Calendar,
  CheckCircle, Clock, GripVertical, ChevronLeft, ChevronRight,
  LayoutDashboard, Kanban, List, BarChart3, Settings, Bell, Users,
  Zap, Flag, Tag, Hash, Code2, Bug, BookOpen, ArrowRight, Filter,
  Shield, User, Heart, LifeBuoy, LogOut,
  MoreHorizontal, Flame, TrendingUp, Activity, ChevronDown, Eye,
  Timer, Star, Cpu, Package, ChevronUp, Layers, Rocket, Sparkles,
  MessageSquare, GitCommit, GitPullRequest, CircleDot, Circle,
  CheckCircle2, RefreshCw, Maximize2, Copy, ExternalLink, Archive,
  SlidersHorizontal, PieChart, Award, ArrowUpRight, Grid3X3, Loader2, ListTodo,
  Paperclip, FileText, Download, Link as LinkIcon, Terminal as TerminalIcon,
  Palette, LayoutTemplate, Shapes, Type, Key, Lock, Palette as ColorIcon, 
  FileJson, FileCode, Hash as HashIcon
} from 'lucide-react';
import { getToken, getEmailFromToken, getUsernameFromToken, clearToken } from '../lib/auth';
import { ThemeToggle } from './ui/ThemeToggle';
import CodeHealth from './pages/CodeHealth';
import MinusURL from './pages/MinusURL';
import JSONFormatter from './pages/JSONFormatter';
import Base64Tool from './pages/Base64Tool';
import JWTDecoder from './pages/JWTDecoder';
import UUIDGenerator from './pages/UUIDGenerator';
import Terminal from './pages/Terminal';
import RegexTester from './pages/RegexTester';
import PasswordGenerator from './pages/PasswordGenerator';
import HashGenerator from './pages/HashGenerator';
import ColorConverter from './pages/ColorConverter';
import URLEncoder from './pages/URLEncoder';
import HTMLEncoder from './pages/HTMLEncoder';
import CSVToJSON from './pages/CSVToJSON';
import LoremGenerator from './pages/LoremGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Custom LayoutSidebar icon component
const LayoutSidebar = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={16} 
    height={16} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={2} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
    <path d="M9 4l0 16" />
  </svg>
);

/* ─── Types ─────────────────────────────────────────────────── */
interface Issue {
  id: string; key: string; title: string; description: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status: 'backlog' | 'selected' | 'in-progress' | 'done';
  assignee_name?: string; assignee_id?: string;
  reporter_id?: string; reporter_name?: string;
  sprint_id?: number | null; parent_id?: string | null;
  story_points?: number | null; labels: string[];
  created_at: string; updated_at: string; resolved_at?: string | null;
  due_date?: string | null; estimated_hours?: number | null; actual_hours?: number | null;
}
interface Sprint {
  id: number; name: string; goal: string;
  state: 'active' | 'future' | 'closed';
  start_date: string; end_date: string; issue_count: number;
}
interface BoardData {
  backlog: Issue[]; selected: Issue[]; 'in-progress': Issue[]; done: Issue[];
}

/* ─── Constants ─────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PRIORITY_CFG = {
  highest: { label: 'Highest', icon: '🔴', dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 ring-red-200',    bar: 'bg-red-500'    },
  high:    { label: 'High',    icon: '🟠', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 ring-orange-200', bar: 'bg-orange-500' },
  medium:  { label: 'Medium',  icon: '🟡', dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 ring-amber-200',  bar: 'bg-amber-400'  },
  low:     { label: 'Low',     icon: '🔵', dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 ring-blue-200',    bar: 'bg-blue-400'   },
  lowest:  { label: 'Lowest',  icon: '⚪', dot: 'bg-slate-300',  badge: 'bg-slate-50 text-slate-600 ring-slate-200', bar: 'bg-slate-300'  },
};

const TYPE_CFG = {
  story: { label: 'Story', color: 'text-blue-600',   bg: 'bg-blue-100',   icon: BookOpen  },
  task:  { label: 'Task',  color: 'text-slate-600',  bg: 'bg-slate-100',  icon: CheckCircle2 },
  bug:   { label: 'Bug',   color: 'text-red-600',    bg: 'bg-red-100',    icon: Bug       },
  epic:  { label: 'Epic',  color: 'text-violet-600', bg: 'bg-violet-100', icon: Zap       },
};

const COL_CFG = {
  backlog:     { title: 'Backlog',     dot: 'bg-slate-400',   glow: 'hover:shadow-slate-200/60',  accent: 'border-slate-200',  count: 'bg-slate-100 text-slate-600'   },
  selected:    { title: 'To Do',       dot: 'bg-blue-500',    glow: 'hover:shadow-blue-100/60',   accent: 'border-blue-200',   count: 'bg-blue-100 text-blue-700'     },
  'in-progress':{ title: 'In Progress', dot: 'bg-amber-500',   glow: 'hover:shadow-amber-100/60',  accent: 'border-amber-200',  count: 'bg-amber-100 text-amber-700'   },
  done:        { title: 'Done',        dot: 'bg-emerald-500', glow: 'hover:shadow-emerald-100/60',accent: 'border-emerald-200',count: 'bg-emerald-100 text-emerald-700'},
};

/* ─── Micro components ──────────────────────────────────────── */
function Avatar({ name, size = 'sm' }: { name?: string; size?: 'xs' | 'sm' | 'md' }) {
  const s = { xs: 'w-5 h-5 text-[9px]', sm: 'w-7 h-7 text-[11px]', md: 'w-9 h-9 text-sm' }[size];
  const colors = ['from-blue-500 to-blue-700','from-violet-500 to-violet-700','from-emerald-500 to-emerald-700','from-orange-500 to-red-500','from-cyan-500 to-blue-500'];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div className={`${s} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold shrink-0`}>
      {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
  );
}

function PriorityDot({ priority }: { priority: Issue['priority'] }) {
  const cfg = PRIORITY_CFG[priority];
  return <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot} shrink-0`} title={cfg.label} />;
}

function IssueTypeIcon({ type, className = '' }: { type: Issue['type']; className?: string }) {
  const cfg = TYPE_CFG[type];
  const Icon = cfg.icon;
  return <Icon className={`w-3.5 h-3.5 ${cfg.color} ${className}`} />;
}

function StatusPill({ status }: { status: Issue['status'] }) {
  const cfg = { backlog: 'bg-slate-100 text-slate-600', selected: 'bg-blue-100 text-blue-700', 'in-progress': 'bg-amber-100 text-amber-700', done: 'bg-emerald-100 text-emerald-700' }[status];
  const label = { backlog: 'Backlog', selected: 'To Do', 'in-progress': 'In Progress', done: 'Done' }[status];
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg}`}>{label}</span>;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">{children}</kbd>;
}

/* ─── Issue Card ─────────────────────────────────────────────── */
function IssueCard({ issue, onDragStart, onDragEnd, onOpen, isDragging }: {
  issue: Issue; onDragStart: () => void; onDragEnd: () => void; onOpen: () => void; isDragging: boolean;
}) {
  const cfg = PRIORITY_CFG[issue.priority];
  const tcfg = TYPE_CFG[issue.type];
  const isOverdue = issue.due_date && new Date(issue.due_date) < new Date() && issue.status !== 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: isDragging ? 0.98 : 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease }}
      draggable
      onDragStart={(e: any) => { onDragStart(); e.dataTransfer.effectAllowed = 'move'; }}
      onDragEnd={() => { onDragEnd(); }}
      onClick={onOpen}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-950/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Priority accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${cfg.bar} opacity-70`} />

      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

      <div className="relative">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-2.5">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 shrink-0" />
          <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md ${tcfg.bg}`}>
            <IssueTypeIcon type={issue.type} />
            <span className={`text-[10px] font-bold ${tcfg.color} uppercase tracking-wide`}>{tcfg.label}</span>
          </div>
          <code className="text-[10px] font-mono text-slate-400 font-semibold">{issue.key}</code>
          <div className="ml-auto flex items-center gap-1.5">
            <PriorityDot priority={issue.priority} />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ${cfg.badge}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
          {issue.title}
        </h4>

        {/* Description */}
        {issue.description && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">{issue.description}</p>
        )}

        {/* Labels */}
        {issue.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {issue.labels.map((l, i) => (
              <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />{l}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {issue.assignee_name
              ? <><Avatar name={issue.assignee_name} size="xs" /><span className="text-[11px] text-slate-500 dark:text-slate-400">{issue.assignee_name}</span></>
              : <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Unassigned</span>}
          </div>
          <div className="flex items-center gap-2">
            {issue.story_points && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded-md ring-1 ring-violet-200">
                <Star className="w-2.5 h-2.5" />{issue.story_points}
              </span>
            )}
            {issue.due_date && (
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isOverdue ? 'bg-red-50 text-red-600 ring-1 ring-red-200' : 'bg-slate-50 text-slate-500'}`}>
                <Calendar className="w-2.5 h-2.5" />
                {new Date(issue.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {issue.estimated_hours && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Timer className="w-2.5 h-2.5" />{issue.estimated_hours}h
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Issue Detail Modal ─────────────────────────────────────── */
function IssueDetailModal({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  const cfg = PRIORITY_CFG[issue.priority];
  const tcfg = TYPE_CFG[issue.type];
  const tabs = ['Details', 'Subtasks', 'Time', 'Attachments', 'Links', 'Watchers', 'Activity', 'Code Links'];
  const [tab, setTab] = useState('Details');
  const [subtasks, setSubtasks] = useState<Issue[]>([]);
  const [subtaskStats, setSubtaskStats] = useState({ total: 0, done: 0, in_progress: 0, completion_percentage: 0 });
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [subtaskForm, setSubtaskForm] = useState({ title: '', type: 'task' as Issue['type'], priority: 'medium' as Issue['priority'] });
  
  // Time tracking state
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [timeStats, setTimeStats] = useState({ total_hours: 0, running_entry: null });
  const [loadingTime, setLoadingTime] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showLogTime, setShowLogTime] = useState(false);
  const [logTimeForm, setLogTimeForm] = useState({ hours: '', minutes: '', description: '' });
  
  // Attachments state
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  
  // Watchers state
  const [watchers, setWatchers] = useState<any[]>([]);
  const [isWatching, setIsWatching] = useState(false);
  const [loadingWatchers, setLoadingWatchers] = useState(false);
  
  // Issue links state
  const [issueLinks, setIssueLinks] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ target_issue_key: '', link_type: 'relates_to' });
  
  const isOverdue = issue.due_date && new Date(issue.due_date) < new Date() && issue.status !== 'done';

  const loadSubtasks = async () => {
    setLoadingSubtasks(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/subtasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubtasks(data.subtasks);
        setSubtaskStats(data.stats);
      }
    } catch (e) { console.error('Failed to load subtasks', e); }
    setLoadingSubtasks(false);
  };

  const createSubtask = async () => {
    if (!subtaskForm.title.trim()) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/product-management/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...subtaskForm, parent_id: issue.id, status: 'backlog' })
      });
      setSubtaskForm({ title: '', type: 'task', priority: 'medium' });
      setShowAddSubtask(false);
      loadSubtasks();
    } catch (e) { console.error('Failed to create subtask', e); }
  };

  useEffect(() => { if (tab === 'Subtasks') loadSubtasks(); }, [tab]);
  useEffect(() => { if (tab === 'Time') loadTimeEntries(); }, [tab]);
  useEffect(() => { if (tab === 'Attachments') loadAttachments(); }, [tab]);
  useEffect(() => { if (tab === 'Watchers') loadWatchers(); }, [tab]);
  useEffect(() => { if (tab === 'Links') loadLinks(); }, [tab]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timeStats.running_entry) {
      interval = setInterval(() => {
        const start = new Date((timeStats.running_entry as any).started_at).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeStats.running_entry]);

  const loadTimeEntries = async () => {
    setLoadingTime(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/time`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimeEntries(data.entries);
        setTimeStats({ total_hours: data.total_hours, running_entry: data.running_entry });
        setTimerRunning(!!data.running_entry);
      }
    } catch (e) { console.error('Failed to load time entries', e); }
    setLoadingTime(false);
  };

  const startTimer = async () => {
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/timer/start`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      loadTimeEntries();
    } catch (e) { console.error('Failed to start timer', e); }
  };

  const stopTimer = async () => {
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/timer/stop`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      setTimerRunning(false);
      setElapsedTime(0);
      loadTimeEntries();
    } catch (e) { console.error('Failed to stop timer', e); }
  };

  const logTime = async () => {
    const hours = parseInt(logTimeForm.hours) || 0;
    const minutes = parseInt(logTimeForm.minutes) || 0;
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes <= 0) return;
    
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/time/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ duration_minutes: totalMinutes, description: logTimeForm.description })
      });
      setLogTimeForm({ hours: '', minutes: '', description: '' });
      setShowLogTime(false);
      loadTimeEntries();
    } catch (e) { console.error('Failed to log time', e); }
  };

  const loadAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/attachments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttachments(data.attachments);
      }
    } catch (e) { console.error('Failed to load attachments', e); }
    setLoadingAttachments(false);
  };

  const loadWatchers = async () => {
    setLoadingWatchers(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/watchers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWatchers(data.watchers);
        // Check if current user is watching
        // This would need the current user ID from auth context
      }
    } catch (e) { console.error('Failed to load watchers', e); }
    setLoadingWatchers(false);
  };

  const toggleWatch = async () => {
    try {
      const token = getToken();
      if (isWatching) {
        await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/watchers`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/watchers`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsWatching(!isWatching);
      loadWatchers();
    } catch (e) { console.error('Failed to toggle watch', e); }
  };

  const loadLinks = async () => {
    setLoadingLinks(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/links`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIssueLinks(data.links);
      }
    } catch (e) { console.error('Failed to load links', e); }
    setLoadingLinks(false);
  };

  const createLink = async () => {
    if (!linkForm.target_issue_key.trim()) return;
    try {
      const token = getToken();
      // First find the issue by key
      const searchRes = await fetch(`${API_BASE}/api/product-management/issues?search=${linkForm.target_issue_key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (searchRes.ok) {
        const issues = await searchRes.json();
        const targetIssue = issues.find((i: any) => i.key === linkForm.target_issue_key);
        if (targetIssue) {
          await fetch(`${API_BASE}/api/product-management/issues/${issue.id}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ target_issue_id: targetIssue.id, link_type: linkForm.link_type })
          });
          setLinkForm({ target_issue_key: '', link_type: 'relates_to' });
          setShowAddLink(false);
          loadLinks();
        }
      }
    } catch (e) { console.error('Failed to create link', e); }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease }}
      >
        {/* Modal header */}
        <div className="flex items-start gap-4 p-6 border-b border-slate-100">
          <div className={`w-10 h-10 rounded-2xl ${tcfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
            <IssueTypeIcon type={issue.type} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-[11px] font-mono text-slate-400 font-bold">{issue.key}</code>
              <StatusPill status={issue.status} />
              {isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">⚠ Overdue</span>}
            </div>
            <h2 className="text-[17px] font-bold text-slate-900 leading-snug">{issue.title}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Copy className="w-4 h-4" /></button>
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><ExternalLink className="w-4 h-4" /></button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-slate-100">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-[13px] font-semibold rounded-t-lg transition-colors -mb-px border-b-2 ${
                tab === t ? 'text-slate-900 border-slate-900' : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >{t}</button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'Details' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
                  <p className="text-[13.5px] text-slate-700 leading-relaxed">{issue.description || <span className="italic text-slate-400">No description provided.</span>}</p>
                </div>
                {issue.labels?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Labels</p>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.labels.map((l,i) => <span key={i} className="text-[11px] font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1"><Tag className="w-3 h-3"/>{l}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Priority', value: <span className="flex items-center gap-1.5"><PriorityDot priority={issue.priority}/><span className="text-[13px] font-semibold">{cfg.label}</span></span> },
                  { label: 'Assignee', value: issue.assignee_name ? <span className="flex items-center gap-2"><Avatar name={issue.assignee_name} size="xs"/><span className="text-[13px]">{issue.assignee_name}</span></span> : <span className="text-[13px] text-slate-400 italic">Unassigned</span> },
                  { label: 'Story Points', value: issue.story_points ? <span className="text-[13px] font-bold text-violet-700">{issue.story_points} pts</span> : <span className="text-[13px] text-slate-400">—</span> },
                  { label: 'Due Date', value: issue.due_date ? <span className={`text-[13px] font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>{new Date(issue.due_date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</span> : <span className="text-[13px] text-slate-400">—</span> },
                  { label: 'Est. Hours', value: <span className="text-[13px]">{issue.estimated_hours ? `${issue.estimated_hours}h` : '—'}</span> },
                  { label: 'Actual Hours', value: <span className="text-[13px]">{issue.actual_hours ? `${issue.actual_hours}h` : '—'}</span> },
                  { label: 'Created', value: <span className="text-[13px] text-slate-600">{new Date(issue.created_at).toLocaleDateString()}</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mt-1">{label}</p>
                    <div className="text-right">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Subtasks' && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-slate-500">Completion</p>
                  <p className="text-[12px] font-black text-slate-700">{subtaskStats.completion_percentage}%</p>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${subtaskStats.completion_percentage}%` }} transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">{subtaskStats.done} of {subtaskStats.total} subtasks done</p>
              </div>

              {/* Subtask list */}
              {loadingSubtasks ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading subtasks…
                </div>
              ) : subtasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-[13px]">No subtasks yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_CFG[subtask.priority].dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate">{subtask.title}</p>
                        <p className="text-[11px] text-slate-400">{subtask.key}</p>
                      </div>
                      <StatusPill status={subtask.status} />
                      {subtask.assignee_name && <Avatar name={subtask.assignee_name} size="xs" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Add subtask button/form */}
              {showAddSubtask ? (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <input
                    value={subtaskForm.title}
                    onChange={e => setSubtaskForm({ ...subtaskForm, title: e.target.value })}
                    placeholder="Subtask title…"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') createSubtask(); if (e.key === 'Escape') setShowAddSubtask(false); }}
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={subtaskForm.type}
                      onChange={e => setSubtaskForm({ ...subtaskForm, type: e.target.value as Issue['type'] })}
                      className="px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="task">Task</option>
                      <option value="bug">Bug</option>
                      <option value="story">Story</option>
                    </select>
                    <select
                      value={subtaskForm.priority}
                      onChange={e => setSubtaskForm({ ...subtaskForm, priority: e.target.value as Issue['priority'] })}
                      className="px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="highest">Highest</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="lowest">Lowest</option>
                    </select>
                    <div className="ml-auto flex gap-1">
                      <button onClick={createSubtask} disabled={!subtaskForm.title.trim()}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors"
                      >Create</button>
                      <button onClick={() => setShowAddSubtask(false)}
                        className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 text-[11px] font-semibold transition-colors"
                      >Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddSubtask(true)}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />Add Subtask
                </button>
              )}
            </div>
          )}

          {tab === 'Activity' && (
            <div className="space-y-4">
              {[
                { user: 'AM', action: 'moved this to In Progress', time: '2h ago', icon: ArrowRight },
                { user: 'KR', action: 'added label "backend"', time: '5h ago', icon: Tag },
                { user: 'SP', action: 'commented on this issue', time: '1d ago', icon: MessageSquare },
                { user: 'AM', action: 'created this issue', time: '2d ago', icon: Plus },
              ].map(({ user, action, time, icon: Icon }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Avatar name={user} size="xs" />
                  <div className="flex-1 min-w-0 bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-[13px] text-slate-700"><strong>{user}</strong> {action}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Code Links' && (
            <div className="space-y-3">
              <p className="text-[13px] text-slate-500">Link commits, branches, and pull requests to this issue.</p>
              {[
                { icon: GitCommit,     label: 'feat: implement auth 2FA',     meta: 'main · 2h ago',    color: 'text-slate-600' },
                { icon: GitBranch,     label: 'feature/auth-2fa',             meta: 'ahead 3 commits',  color: 'text-blue-600'  },
                { icon: GitPullRequest,label: 'PR #48 · Auth 2FA flow',       meta: 'Open · 2 reviews', color: 'text-violet-600'},
              ].map(({ icon: Icon, label, meta, color }, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center`}><Icon className={`w-4 h-4 ${color}`} /></div>
                  <div className="flex-1"><p className="text-[13px] font-semibold text-slate-800">{label}</p><p className="text-[11px] text-slate-400">{meta}</p></div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              ))}
              <button className="w-full mt-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />Add Code Link
              </button>
            </div>
          )}

          {/* Time Tracking Tab */}
          {tab === 'Time' && (
            <div className="space-y-4">
              {/* Timer Display */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Total Time</p>
                    <p className="text-[24px] font-black text-slate-800">{timeStats.total_hours}h</p>
                  </div>
                  {timerRunning ? (
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-orange-500 uppercase animate-pulse">Recording</p>
                      <p className="text-[20px] font-mono font-bold text-orange-600">{formatDuration(elapsedTime)}</p>
                    </div>
                  ) : (
                    <button onClick={startTimer}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-colors"
                    >
                      <Timer className="w-4 h-4" />Start Timer
                    </button>
                  )}
                </div>
                {timerRunning && (
                  <button onClick={stopTimer}
                    className="w-full mt-3 py-2 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <CircleDot className="w-4 h-4" />Stop Timer
                  </button>
                )}
              </div>

              {/* Log Time Button */}
              {!showLogTime ? (
                <button onClick={() => setShowLogTime(true)}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />Log Time Manually
                </button>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={logTimeForm.hours}
                      onChange={e => setLogTimeForm({ ...logTimeForm, hours: e.target.value })}
                      placeholder="Hours"
                      className="w-20 px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                    <input
                      type="number"
                      value={logTimeForm.minutes}
                      onChange={e => setLogTimeForm({ ...logTimeForm, minutes: e.target.value })}
                      placeholder="Minutes"
                      className="w-24 px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                    <input
                      value={logTimeForm.description}
                      onChange={e => setLogTimeForm({ ...logTimeForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="flex-1 px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={logTime} disabled={!logTimeForm.hours && !logTimeForm.minutes}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors"
                    >Log Time</button>
                    <button onClick={() => setShowLogTime(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 text-[11px] font-semibold transition-colors"
                    >Cancel</button>
                  </div>
                </div>
              )}

              {/* Time Entries List */}
              {loadingTime ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading time entries…
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Timer className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-[13px]">No time logged yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeEntries.map((entry: any) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800">
                          {Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m
                        </p>
                        <p className="text-[11px] text-slate-400">{entry.description || 'Time logged'}</p>
                      </div>
                      <span className="text-[11px] text-slate-400">{entry.user_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attachments Tab */}
          {tab === 'Attachments' && (
            <div className="space-y-4">
              <button className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                <Paperclip className="w-4 h-4" />Upload Attachment
              </button>
              
              {loadingAttachments ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading attachments…
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Paperclip className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-[13px]">No attachments yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att: any) => (
                    <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate">{att.original_name}</p>
                        <p className="text-[11px] text-slate-400">{(att.size_bytes / 1024).toFixed(1)} KB • {att.user_name}</p>
                      </div>
                      <Download className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Links Tab */}
          {tab === 'Links' && (
            <div className="space-y-4">
              {showAddLink ? (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <input
                    value={linkForm.target_issue_key}
                    onChange={e => setLinkForm({ ...linkForm, target_issue_key: e.target.value })}
                    placeholder="Issue key (e.g., PROD-123)"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                    autoFocus
                  />
                  <select
                    value={linkForm.link_type}
                    onChange={e => setLinkForm({ ...linkForm, link_type: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="relates_to">Relates to</option>
                    <option value="blocks">Blocks</option>
                    <option value="blocked_by">Blocked by</option>
                    <option value="duplicates">Duplicates</option>
                  </select>
                  <div className="flex gap-1">
                    <button onClick={createLink} disabled={!linkForm.target_issue_key.trim()}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors"
                    >Link Issue</button>
                    <button onClick={() => setShowAddLink(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 text-[11px] font-semibold transition-colors"
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddLink(true)}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />Link Issue
                </button>
              )}
              
              {loadingLinks ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading links…
                </div>
              ) : issueLinks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <LinkIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-[13px]">No linked issues</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {issueLinks.map((link: any) => (
                    <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${link.direction === 'outgoing' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate">{link.issue?.title || 'Unknown Issue'}</p>
                        <p className="text-[11px] text-slate-400">{link.issue?.key} • {link.link_type.replace(/_/g, ' ')}</p>
                      </div>
                      <StatusPill status={link.issue?.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Watchers Tab */}
          {tab === 'Watchers' && (
            <div className="space-y-4">
              <button onClick={toggleWatch}
                className={`w-full py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isWatching 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                {isWatching ? 'Stop Watching' : 'Watch This Issue'}
              </button>
              
              {loadingWatchers ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading watchers…
                </div>
              ) : watchers.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-[13px]">No watchers yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {watchers.map((watcher: any) => (
                    <div key={watcher.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                      <Avatar name={watcher.user_name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800">{watcher.user_name}</p>
                        <p className="text-[11px] text-slate-400">{watcher.email}</p>
                      </div>
                      <span className="text-[11px] text-slate-400">Watching</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ProductManagement() {
  const params = useParams<{ tool?: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const TOOL_TABS = [
    'codehealth', 'minusurl', 'json', 'base64', 'jwt', 'uuid', 'terminal',
    'regex', 'password', 'hash', 'color', 'urlencoder', 'htmlencoder', 'csvjson', 'lorem'
  ] as const;

  const getToolFromPath = (path: string) => {
    const match = path.match(/^\/product-management\/tools\/([^/]+)$/);
    const tool = match?.[1];
    if (tool && (TOOL_TABS as readonly string[]).includes(tool)) return tool;
    return null;
  };

  const initialActiveTab = (() => {
    const toolParam = params?.tool;
    if (typeof toolParam === 'string' && (TOOL_TABS as readonly string[]).includes(toolParam)) {
      return toolParam as any;
    }
    if (typeof window !== 'undefined') {
      const tool = getToolFromPath(window.location.pathname);
      if (tool) return tool as any;
    }
    return 'board' as const;
  })();

  const [activeTab, setActiveTab] = useState<
    | 'board'
    | 'backlog'
    | 'sprints'
    | 'reports'
    | 'codehealth'
    | 'minusurl'
    | 'json'
    | 'base64'
    | 'jwt'
    | 'uuid'
    | 'terminal'
    | 'regex'
    | 'password'
    | 'hash'
    | 'color'
    | 'urlencoder'
    | 'htmlencoder'
    | 'csvjson'
    | 'lorem'
  >(initialActiveTab);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar'>('board');
  const [boardData, setBoardData] = useState<BoardData>({ backlog: [], selected: [], 'in-progress': [], done: [] });
  const [calendarData, setCalendarData] = useState<{ calendar: Record<string, Issue[]>; noDueDate: Issue[]; totalIssues: number }>({ calendar: {}, noDueDate: [], totalIssues: 0 });
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const isToolTab = !(['board', 'backlog', 'sprints', 'reports'] as const).includes(activeTab as any);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [devToolsDropdownUp, setDevToolsDropdownUp] = useState(false);
  const [designToolsDropdownUp, setDesignToolsDropdownUp] = useState(false);

  // User session state
  const [token, setToken] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setToken(getToken());
  }, []);

  const email = token ? getEmailFromToken(token) : '';
  const username = token ? getUsernameFromToken(token) : '';
  const initials = (username || email || 'U')
    .split(/[@._-]/g).filter(Boolean).slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase()).join('').slice(0, 2);

  const profileLinks = [
    { icon: User, label: 'My Profile', sub: 'View your public profile', href: '/profile' },
    { icon: Settings, label: 'Account Settings', sub: 'Preferences & security', href: '/profile' },
    { icon: Heart, label: 'My Favourites', sub: 'Saved tools & pastes', href: '/profile?favorites=true' },
    { icon: Bell, label: 'Notifications', sub: 'Updates & alerts', href: '/notifications' },
    { icon: LifeBuoy, label: 'Help & Support', sub: 'Get assistance', href: '/support' },
  ];

  const checkDropdownDirection = (event: React.MouseEvent, setDirection: (up: boolean) => void) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 320; // max-h-80 = 320px
    
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDirection(true);
    } else {
      setDirection(false);
    }
  };
  const [notifications, setNotifications] = useState(3);
  const [workspaces, setWorkspaces] = useState([
    { id: 'default', name: 'Default Workspace', color: 'from-violet-500 to-violet-700' },
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('default');
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [devToolsShowAll, setDevToolsShowAll] = useState(false);

  const [designToolsOpen, setDesignToolsOpen] = useState(false);
  const [designToolsShowAll, setDesignToolsShowAll] = useState(false);

  useEffect(() => {
    const toolParam = params?.tool;
    if (typeof toolParam === 'string' && (TOOL_TABS as readonly string[]).includes(toolParam)) {
      setActiveTab(toolParam as any);
    }
  }, [params?.tool]);

  useEffect(() => {
    if (!isToolTab) return;
    setDevToolsOpen(true);

    const alwaysVisible = ['codehealth', 'minusurl'] as const;
    if (!(alwaysVisible as readonly string[]).includes(activeTab as any)) {
      setDevToolsShowAll(true);
    }
  }, [isToolTab, activeTab]);

  useEffect(() => {
    const onPopState = () => {
      const tool = getToolFromPath(window.location.pathname);
      if (tool) {
        setActiveTab(tool as any);
        return;
      }
      setActiveTab('board');
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateToTab = (tab: typeof activeTab) => {
    const isTool = (TOOL_TABS as readonly string[]).includes(tab as any);
    if (isTool) {
      const desired = `/product-management/tools/${tab}`;
      if (typeof window !== 'undefined' && window.location.pathname !== desired) {
        window.history.pushState({}, '', desired);
      }
      setActiveTab(tab);
      return;
    }

    if (typeof window !== 'undefined' && window.location.pathname !== '/product-management') {
      window.history.pushState({}, '', '/product-management');
    }
    setActiveTab(tab);
  };

  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target as Node)) {
        setShowWorkspaceDropdown(false);
        setShowAddWorkspace(false);
        setWorkspaceSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [issueForm, setIssueForm] = useState({
    title: '', description: '', type: 'task' as Issue['type'],
    priority: 'medium' as Issue['priority'], story_points: '',
    labels: '', assignee: '', due_date: '', estimated_hours: '', parent_id: ''
  });
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', start_date: '', end_date: '' });

  const mockUsers = [
    { id: '1', name: 'Aryan M.' }, { id: '2', name: 'Kiran R.' },
    { id: '3', name: 'Shreya P.' }, { id: '4', name: 'Jayesh K.' },
  ];

  const allIssues = [...boardData.backlog, ...boardData.selected, ...boardData['in-progress'], ...boardData.done];
  const filteredIssues = allIssues.filter(i =>
    (!searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.key.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterPriority === 'all' || i.priority === filterPriority)
  );

  /* ── API helpers ── */
  const api = async (ep: string, opts: RequestInit = {}) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/product-management${ep}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers }
    });
    if (res.status === 401) { router.push('/login'); return null; }
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'API error'); }
    return res.json();
  };

  const loadBoard = async () => {
    try { setLoading(true); const d = await api(`/board${selectedSprint ? `?sprint_id=${selectedSprint}` : ''}`); if (d) setBoardData(d); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  const loadCalendar = async () => {
    try { setLoading(true); const d = await api('/calendar'); if (d) setCalendarData(d); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  const loadSprints = async () => {
    try {
      const d = await api('/sprints');
      if (d) { setSprints(d); const a = d.find((s: Sprint) => s.state === 'active'); if (a && !selectedSprint) setSelectedSprint(a.id); }
    } catch {}
  };
  const createIssue = async () => {
    try {
      const labels = issueForm.labels.split(',').map(l => l.trim()).filter(Boolean);
      await api('/issues', { method: 'POST', body: JSON.stringify({ ...issueForm, labels, story_points: issueForm.story_points ? parseInt(issueForm.story_points) : null, sprint_id: selectedSprint, status: 'backlog' }) });
      setShowCreateModal(false);
      setIssueForm({ title:'', description:'', type:'task', priority:'medium', story_points:'', labels:'', assignee:'', due_date:'', estimated_hours:'', parent_id:'' });
      loadBoard(); loadSprints();
    } catch (e: any) { setError(e.message); }
  };
  const createSprint = async () => {
    try { await api('/sprints', { method: 'POST', body: JSON.stringify({ ...sprintForm, state: 'future' }) }); setShowSprintModal(false); setSprintForm({ name:'', goal:'', start_date:'', end_date:'' }); loadSprints(); }
    catch (e: any) { setError(e.message); }
  };
  const moveIssue = async (issueId: string, newStatus: string) => {
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/product-management/issues/${issueId}/move`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      await loadBoard();
    } catch (e: any) { setError(e.message); }
  };

  useEffect(() => { loadSprints(); }, []);
  useEffect(() => { if (activeTab === 'board') loadBoard(); }, [activeTab, selectedSprint]);
  useEffect(() => { if (activeTab === 'board' && viewMode === 'calendar') loadCalendar(); }, [viewMode]);
  useEffect(() => { setCurrentMonth(new Date()); }, []);

  /* ── drag-drop ── */
  const handleDrop = async (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedIssue && draggedIssue.status !== col) await moveIssue(draggedIssue.id, col);
    setDraggedIssue(null);
  };

  /* ── calendar ── */
  const getCalendarDays = () => {
    const y = currentMonth.getFullYear(), m = currentMonth.getMonth();
    const first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate(), dipm = new Date(y, m, 0).getDate();
    const today = new Date(), ty = today.getFullYear(), tm = today.getMonth(), td = today.getDate();
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--) days.push({ date: new Date(y, m - 1, dipm - i), isCurrentMonth: false, isToday: false });
    for (let i = 1; i <= dim; i++) days.push({ date: new Date(y, m, i), isCurrentMonth: true, isToday: y === ty && m === tm && i === td });
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++) days.push({ date: new Date(y, m + 1, i), isCurrentMonth: false, isToday: false });
    return days;
  };

  /* ── sidebar nav items ── */
  const navItems = [
    { id: 'board',    label: 'Board',    icon: Kanban,        tab: 'board'   as const },
    { id: 'backlog',  label: 'Backlog',  icon: Layers,        tab: 'backlog' as const },
    { id: 'sprints',  label: 'Sprints',  icon: Rocket,        tab: 'sprints' as const },
    { id: 'reports',  label: 'Reports',  icon: BarChart3,     tab: 'reports' as const },
  ];

  /* ── sprint completion percent ── */
  const total = allIssues.length;
  const done = boardData.done.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  /* ── workspace helpers ── */
  const wsColors = [
    'from-violet-500 to-violet-700','from-blue-500 to-blue-700',
    'from-emerald-500 to-emerald-700','from-orange-500 to-red-500',
    'from-pink-500 to-rose-600','from-cyan-500 to-blue-600',
  ];

  const addWorkspace = () => {
    const name = newWorkspaceName.trim();
    if (!name) return;
    const id = Date.now().toString();
    const color = wsColors[workspaces.length % wsColors.length];
    const ws = { id, name, color };
    setWorkspaces(prev => [...prev, ws]);
    setSelectedWorkspace(id);
    setNewWorkspaceName('');
    setShowAddWorkspace(false);
    setShowWorkspaceDropdown(false);
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  const activeWorkspace = workspaces.find(ws => ws.id === selectedWorkspace) ?? workspaces[0];

  return (
    <div className="flex h-screen overflow-hidden font-sans p-3 gap-3 bg-white dark:bg-slate-950">

      {/* ══ SIDEBAR ═══════════════════════════════════════════════ */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 100 : 240 }}
        transition={{ duration: 0.25, ease }}
        className="shrink-0 bg-white dark:bg-slate-900 rounded-2xl flex flex-col overflow-hidden relative z-20 shadow-sm dark:shadow-slate-950 border border-slate-200/80 dark:border-slate-700/80"
      >
        {/* Logo */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shadow-orange-200 shrink-0">
            <Target className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-[15px] font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">OpenKai</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Product Manager</p>
            </motion.div>
          )}
        </div>

        {/* ── Workspace selector ── */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 relative" ref={workspaceDropdownRef}>
            <button
              onClick={() => { setShowWorkspaceDropdown(v => !v); setWorkspaceSearch(''); setShowAddWorkspace(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors group"
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${activeWorkspace.color} flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="text-white text-[10px] font-black">{activeWorkspace.name.charAt(0)}</span>
              </div>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex-1 text-left truncate">{activeWorkspace.name}</span>
              <motion.div animate={{ rotate: showWorkspaceDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </motion.div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showWorkspaceDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease }}
                  className="absolute left-3 right-3 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-50"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                >
                  {/* Search */}
                  <div className="px-3 pt-3 pb-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <input
                        value={workspaceSearch}
                        onChange={e => setWorkspaceSearch(e.target.value)}
                        placeholder="Search workspaces…"
                        className="w-full pl-7 pr-3 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="px-2 pb-2 max-h-48 overflow-y-auto">
                    {filteredWorkspaces.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-4">No workspaces found</p>
                    ) : filteredWorkspaces.map(ws => (
                      <button key={ws.id}
                        onClick={() => { setSelectedWorkspace(ws.id); setShowWorkspaceDropdown(false); }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left ${
                          selectedWorkspace === ws.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${ws.color} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-[10px] font-black">{ws.name.charAt(0)}</span>
                        </div>
                        <span className="text-[12.5px] font-semibold text-slate-700 flex-1 truncate">{ws.name}</span>
                        {selectedWorkspace === ws.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Add workspace */}
                  <div className="border-t border-slate-100 p-2">
                    {showAddWorkspace ? (
                      <div className="px-1">
                        <input
                          value={newWorkspaceName}
                          onChange={e => setNewWorkspaceName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addWorkspace(); if (e.key === 'Escape') setShowAddWorkspace(false); }}
                          placeholder="Workspace name…"
                          className="w-full px-3 py-2 text-[12px] rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-200 mb-2 placeholder:text-slate-400"
                          autoFocus
                        />
                        <div className="flex gap-1.5">
                          <button onClick={addWorkspace} disabled={!newWorkspaceName.trim()}
                            className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors"
                          >Create</button>
                          <button onClick={() => { setShowAddWorkspace(false); setNewWorkspaceName(''); }}
                            className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-[11px] font-semibold transition-colors"
                          >Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddWorkspace(true)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-6 h-6 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-slate-400 transition-colors">
                          <Plus className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="text-[12px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Add workspace</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Nav links */}
        <nav className={`flex-1 px-2 py-3 ${sidebarCollapsed ? 'space-y-1' : 'space-y-0.5'}`}>
          {navItems.map(({ id, label, icon: Icon, tab }) => {
            const active = activeTab === tab;
            return (
              <motion.button key={id} whileHover={sidebarCollapsed ? {} : { x: 2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigateToTab(tab as any)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-${sidebarCollapsed ? '3' : '2.5'} rounded-xl transition-all duration-150 ${sidebarCollapsed ? '' : 'text-left'} group relative ${
                  active
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-orange-400 dark:text-orange-500' : ''}`} />
                {!sidebarCollapsed && <span className="text-[13px] font-semibold">{label}</span>}
                {active && !sidebarCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {label}
                  </div>
                )}
              </motion.button>
            );
          })}

          {/* Dev Tools section */}
          <div className={`${sidebarCollapsed ? 'pt-6' : 'pt-4'}`}>
            <button
              onClick={(e) => {
                checkDropdownDirection(e, setDevToolsDropdownUp);
                setDevToolsOpen(v => !v);
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center gap-1' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all duration-150 text-left group relative ${
                isToolTab
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className={`w-4 h-4 shrink-0 ${isToolTab ? 'text-slate-400 dark:text-slate-500' : ''}`} />
              {!sidebarCollapsed && <span className="text-[12.5px] font-semibold">Developer Tools</span>}
              {!sidebarCollapsed && <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${devToolsOpen ? (devToolsDropdownUp ? 'rotate-180' : 'rotate-180') : ''}`} />}
              {sidebarCollapsed && <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${devToolsOpen ? 'rotate-180' : ''}`} />}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50" style={{ minWidth: 'max-content' }}>
                  Developer Tools
                </div>
              )}
            </button>

              <AnimatePresence initial={false}>
                {devToolsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`${devToolsDropdownUp ? 'mb-1' : 'mt-1'} ${sidebarCollapsed ? '' : 'pl-2 border-l border-slate-200 dark:border-slate-700'} overflow-hidden`}
                  >
                    <ScrollArea className="max-h-44">
                      <div className={`pr-2 ${sidebarCollapsed ? 'space-y-1' : ''} ${sidebarCollapsed ? 'min-w-0' : ''}`}>
                    {([
                      { id: 'json', label: 'JSON Formatter', icon: FileJson },
                      { id: 'base64', label: 'Base64 Tool', icon: HashIcon },
                      ...(sidebarCollapsed || devToolsShowAll
                        ? ([
                          { id: 'jwt', label: 'JWT Decoder', icon: Shield },
                          { id: 'uuid', label: 'UUID Generator', icon: Cpu },
                          { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
                          { id: 'regex', label: 'Regex Tester', icon: Code2 },
                          { id: 'password', label: 'Password Generator', icon: Lock },
                          { id: 'hash', label: 'Hash Generator', icon: Hash },
                          { id: 'color', label: 'Color Converter', icon: ColorIcon },
                          { id: 'urlencoder', label: 'URL Encoder', icon: LinkIcon },
                          { id: 'htmlencoder', label: 'HTML Encoder', icon: FileCode },
                          { id: 'csvjson', label: 'CSV to JSON', icon: FileJson },
                          { id: 'lorem', label: 'Lorem Generator', icon: Type },
                          { id: 'codehealth', label: 'Code Review', icon: Code2 },
                          { id: 'minusurl', label: 'MinusURL', icon: LinkIcon },
                        ] as const)
                        : ([] as const)),
                      { id: 'docs', label: 'API Docs', icon: BookOpen, href: '/docs' as const },
                    ] as const).map((item) => {
                      const { id, label, icon: Icon } = item;
                      const href = 'href' in item ? item.href : undefined;
                      return (
                      <button
                        key={label}
                        onClick={() => {
                          if (id === 'docs' && href) {
                            router.push(href);
                            return;
                          }
                          navigateToTab(id as any);
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-${sidebarCollapsed ? '2.5' : '2'} rounded-xl transition-all duration-150 text-left group relative overflow-hidden ${
                          activeTab === (id as any) && id !== 'docs'
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${activeTab === (id as any) && id !== 'docs' ? 'text-orange-400 dark:text-orange-500' : ''}`} />
                        {!sidebarCollapsed && <span className="text-[12.5px] font-medium">{label}</span>}
                        {activeTab === (id as any) && id !== 'docs' && !sidebarCollapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                        )}
                        {sidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {label}
                          </div>
                        )}
                      </button>
                      );
                    })}

                    {!devToolsShowAll && !sidebarCollapsed && (
                      <button
                        onClick={() => setDevToolsShowAll(true)}
                        className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative"
                      >
                        <span className="text-[12px] font-semibold">See more</span>
                      </button>
                    )}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>

          </div>

          <div className={`${sidebarCollapsed ? 'pt-6' : 'pt-2'}`}>
                <button
                  onClick={(e) => {
                    if (!sidebarCollapsed) {
                      checkDropdownDirection(e, setDesignToolsDropdownUp);
                      setDesignToolsOpen(v => !v);
                    }
                  }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center gap-1' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all duration-150 text-left text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 group relative ${sidebarCollapsed ? 'cursor-not-allowed' : ''}`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="text-[12.5px] font-semibold">Design Tools</span>}
                  {!sidebarCollapsed && <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${designToolsOpen ? (designToolsDropdownUp ? 'rotate-180' : 'rotate-180') : ''}`} />}
                  {sidebarCollapsed && <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${designToolsOpen ? 'rotate-180' : ''}`} />}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Design Tools
                    </div>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {designToolsOpen && !sidebarCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`${designToolsDropdownUp ? 'mb-1' : 'mt-1'} ${sidebarCollapsed ? '' : 'pl-2 border-l border-slate-200'} overflow-hidden`}
                    >
                      <ScrollArea className="max-h-60">
                        <div className={`pr-2 ${sidebarCollapsed ? 'space-y-1' : ''}`}>
                      {([
                        { label: 'Design Studio', icon: LayoutTemplate },
                        { label: 'UI Playground', icon: Shapes },
                        ...(sidebarCollapsed || designToolsShowAll
                          ? ([
                            { label: 'Color Palette', icon: Palette },
                            { label: 'Typography', icon: Type },
                          ] as const)
                          : ([] as const)),
                      ] as const).map(({ label, icon: Icon }) => (
                        <button
                          key={label}
                          disabled
                          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-${sidebarCollapsed ? '2.5' : '2'} rounded-xl transition-all duration-150 text-left text-slate-400 cursor-not-allowed group relative`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {!sidebarCollapsed && <span className="text-[12.5px] font-medium">{label}</span>}
                          {!sidebarCollapsed && <span className="ml-auto text-[10px] font-semibold text-slate-300">Soon</span>}
                          {sidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              {label} (Coming soon)
                            </div>
                          )}
                        </button>
                      ))}

                      {!designToolsShowAll && !sidebarCollapsed && (
                        <button
                          onClick={() => setDesignToolsShowAll(true)}
                          className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all group relative"
                        >
                          <span className="text-[12px] font-semibold">See more</span>
                        </button>
                      )}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
        </nav>

        {/* Sprint progress mini */}
        {!sidebarCollapsed && total > 0 && (
          <div className="px-3 py-3 border-t border-slate-100 shrink-0">
            <div className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-slate-500">Sprint Progress</p>
                <p className="text-[12px] font-black text-orange-500">{pct}%</p>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">{done} of {total} issues done</p>
            </div>
          </div>
        )}

        {/* Bottom: User Profile & Collapse */}
        <div className="px-2 py-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5 shrink-0">
          {/* User Profile with Menu */}
          <div 
            className={`relative ${sidebarCollapsed ? '' : 'group'}`}
            onMouseEnter={() => !sidebarCollapsed && setShowProfileMenu(true)}
            onMouseLeave={() => !sidebarCollapsed && setShowProfileMenu(false)}
          >
            <div className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer relative`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                {initials || 'U'}
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{username || 'User'}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{email || 'user@email.com'}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-slate-800" />
                </>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {username || 'User Profile'}
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            {!sidebarCollapsed && (
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
                    className="absolute right-0 top-0 translate-x-[102%] w-[240px] rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/40 overflow-hidden z-50"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                    
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">{username || 'User'}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {profileLinks.map(({ icon: Icon, label, sub, href }) => (
                        <button
                          key={`${href}-${label}`}
                          onClick={() => { setShowProfileMenu(false); router.push(href); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-all duration-150 group text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 group-hover:scale-105 transition-all duration-150">
                            <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-medium text-slate-700 dark:text-slate-300">{label}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Sign Out */}
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-1" />
                    <div className="p-2">
                      <button
                        onClick={() => { setShowProfileMenu(false); clearToken(); router.push('/'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 active:bg-red-100 dark:active:bg-red-950/50 transition-all duration-150 group text-left"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center shrink-0 group-hover:bg-red-100 dark:group-hover:bg-red-950/70 group-hover:scale-105 transition-all duration-150">
                          <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </div>
                        <span className="text-[12.5px] font-medium text-red-600 dark:text-red-400">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Back to Tools button - commented out */}
          {/* <button onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[12px] font-medium">Back to Tools</span>}
          </button> */}
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative group"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <LayoutSidebar className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="text-[12px] font-medium">Collapse Sidebar</span>}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Expand sidebar
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* ══ MAIN AREA ════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm dark:shadow-slate-950">

        {/* ─ Top bar ─ */}
        <header className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-700/70 px-6 py-3 flex items-center gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">OpenKai</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-slate-100 font-bold capitalize">{activeTab}</span>
          </div>

          {!isToolTab && (
            <>
              {/* Search */}
              <div className="flex-1 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search issues…  ⌘K"
                  className="w-full pl-9 pr-4 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* View toggle */}
                {activeTab === 'board' && (
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 gap-0.5">
                    {([['board', Kanban], ['list', List], ['calendar', Calendar]] as const).map(([v, Icon]) => (
                      <button key={v} onClick={() => setViewMode(v)}
                        className={`p-2 rounded-lg transition-all ${viewMode === v ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Filter */}
                <button onClick={() => setShowFilters(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-colors ${showFilters ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                  {filterPriority !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{notifications}</span>}
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Sprint sprint selector */}
                <select value={selectedSprint || ''} onChange={e => setSelectedSprint(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="">No Sprint</option>
                  {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                {/* Create CTA */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => activeTab === 'sprints' ? setShowSprintModal(true) : setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[13px] font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {activeTab === 'sprints' ? 'New Sprint' : 'New Issue'}
                </motion.button>
              </div>
            </>
          )}
        </header>

        {/* Filter strip */}
        <AnimatePresence>
          {!isToolTab && showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 overflow-hidden"
            >
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Priority</p>
              <div className="flex items-center gap-1.5">
                {(['all', 'highest', 'high', 'medium', 'low', 'lowest'] as const).map(p => (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      filterPriority === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CFG[p as keyof typeof PRIORITY_CFG]?.dot}`} />}
                    {p === 'all' ? 'All' : PRIORITY_CFG[p as keyof typeof PRIORITY_CFG]?.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-3 text-[12px] text-slate-500">
                <span>{filteredIssues.length} of {allIssues.length} issues</span>
                <button onClick={() => { setFilterPriority('all'); setSearchQuery(''); setShowFilters(false); }} className="text-red-500 font-semibold hover:text-red-600">Clear</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-red-700 text-[13px]"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
              <button onClick={() => setError('')} className="ml-auto p-1 rounded hover:bg-red-100"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─ Content area ─ */}
        <div className="flex-1 overflow-auto">

          {/* ══ CODE REVIEW / CODE HEALTH ═════════════════════════ */}
          {activeTab === 'codehealth' && (
            <CodeHealth embedded />
          )}

          {/* ══ MINUSURL ══════════════════════════════════════════ */}
          {activeTab === 'minusurl' && (
            <MinusURL embedded />
          )}

          {/* ══ JSON FORMATTER ════════════════════════════════════ */}
          {activeTab === 'json' && (
            <JSONFormatter embedded />
          )}

          {/* ══ BASE64 TOOL ═══════════════════════════════════════ */}
          {activeTab === 'base64' && (
            <Base64Tool embedded />
          )}

          {/* ══ JWT DECODER ═══════════════════════════════════════ */}
          {activeTab === 'jwt' && (
            <JWTDecoder embedded />
          )}

          {/* ══ UUID GENERATOR ═════════════════════════════════════ */}
          {activeTab === 'uuid' && (
            <UUIDGenerator embedded />
          )}

          {/* ══ TERMINAL ══════════════════════════════════════════ */}
          {activeTab === 'terminal' && (
            <Terminal embedded />
          )}

          {/* ══ REGEX TESTER ═══════════════════════════════════════ */}
          {activeTab === 'regex' && (
            <RegexTester embedded />
          )}

          {/* ══ PASSWORD GENERATOR ═════════════════════════════════ */}
          {activeTab === 'password' && (
            <PasswordGenerator embedded />
          )}

          {/* ══ HASH GENERATOR ═════════════════════════════════════ */}
          {activeTab === 'hash' && (
            <HashGenerator embedded />
          )}

          {/* ══ COLOR CONVERTER ════════════════════════════════════ */}
          {activeTab === 'color' && (
            <ColorConverter embedded />
          )}

          {/* ══ URL ENCODER ════════════════════════════════════════ */}
          {activeTab === 'urlencoder' && (
            <URLEncoder embedded />
          )}

          {/* ══ HTML ENCODER ═══════════════════════════════════════ */}
          {activeTab === 'htmlencoder' && (
            <HTMLEncoder embedded />
          )}

          {/* ══ CSV TO JSON ═════════════════════════════════════════ */}
          {activeTab === 'csvjson' && (
            <CSVToJSON embedded />
          )}

          {/* ══ LOREM GENERATOR ═════════════════════════════════════ */}
          {activeTab === 'lorem' && (
            <LoremGenerator embedded />
          )}

          {/* ══ BOARD VIEW ════════════════════════════════════════ */}
          {activeTab === 'board' && viewMode === 'board' && (
            <div className="p-6 h-full">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total',       value: total,                     icon: Layers,   color: 'text-slate-600',   bg: 'bg-slate-100'   },
                  { label: 'In Progress', value: boardData['in-progress'].length, icon: Activity, color: 'text-amber-600',  bg: 'bg-amber-50'    },
                  { label: 'Done',        value: done,                      icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Completion',  value: `${pct}%`,                 icon: PieChart, color: 'text-orange-600',  bg: 'bg-orange-50'   },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 px-4 py-3 flex items-center gap-3 shadow-sm dark:shadow-slate-950">
                    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}><Icon className={`w-4.5 h-4.5 ${color}`} /></div>
                    <div><p className="text-xl font-black text-slate-900 dark:text-slate-100">{value}</p><p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p></div>
                  </div>
                ))}
              </div>

              {/* Kanban columns */}
              <div className="grid grid-cols-4 gap-4 h-[calc(100%-80px)]">
                {(['backlog', 'selected', 'in-progress', 'done'] as const).map(col => {
                  const cfg = COL_CFG[col];
                  const issues = boardData[col].filter(i =>
                    (!searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.key.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (filterPriority === 'all' || i.priority === filterPriority)
                  );
                  const isDragOver = dragOverCol === col;

                  return (
                    <div key={col}
                      className={`flex flex-col rounded-2xl border-2 transition-all duration-200 ${
                        isDragOver ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-950/20 shadow-lg shadow-orange-100/60 dark:shadow-orange-900/20' : `border-transparent bg-white/60 dark:bg-slate-800/60 ${cfg.glow}`
                      } shadow-sm`}
                      onDragOver={e => { e.preventDefault(); setDragOverCol(col); }}
                      onDragLeave={() => setDragOverCol(null)}
                      onDrop={e => handleDrop(e, col)}
                    >
                      {/* Column header */}
                      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{cfg.title}</h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.count}`}>{issues.length}</span>
                        <button onClick={() => setShowCreateModal(true)} className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Cards */}
                      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <AnimatePresence>
                          {issues.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed transition-colors ${
                                isDragOver ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' : 'border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                                <GripVertical className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                              </div>
                              <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">{isDragOver ? 'Drop here' : 'No issues'}</p>
                            </motion.div>
                          ) : issues.map(issue => (
                            <IssueCard key={issue.id} issue={issue}
                              onDragStart={() => setDraggedIssue(issue)}
                              onDragEnd={() => { setDraggedIssue(null); setDragOverCol(null); }}
                              onOpen={() => { setSelectedIssue(issue); setShowIssueDetails(true); }}
                              isDragging={draggedIssue?.id === issue.id}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ LIST VIEW ═════════════════════════════════════════ */}
          {activeTab === 'board' && viewMode === 'list' && (
            <div className="p-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm dark:shadow-slate-950 overflow-hidden">
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,1fr] gap-0 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  {['Issue', 'Type', 'Priority', 'Status', 'Assignee', 'Points', 'Due'].map(h => <span key={h}>{h}</span>)}
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  <AnimatePresence>
                    {filteredIssues.map((issue, i) => (
                      <motion.div key={issue.id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                        onClick={() => { setSelectedIssue(issue); setShowIssueDetails(true); }}
                        className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,1fr] gap-0 items-center px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-4">
                          <IssueTypeIcon type={issue.type} />
                          <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">{issue.key}</code>
                          <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-slate-700 dark:group-hover:text-slate-200">{issue.title}</span>
                        </div>
                        <div><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${TYPE_CFG[issue.type].bg} ${TYPE_CFG[issue.type].color}`}>{TYPE_CFG[issue.type].label}</span></div>
                        <div className="flex items-center gap-1.5"><PriorityDot priority={issue.priority} /><span className="text-[12px] text-slate-600 dark:text-slate-400">{PRIORITY_CFG[issue.priority].label}</span></div>
                        <div><StatusPill status={issue.status} /></div>
                        <div>{issue.assignee_name ? <div className="flex items-center gap-1.5"><Avatar name={issue.assignee_name} size="xs" /><span className="text-[12px] text-slate-600 dark:text-slate-400">{issue.assignee_name}</span></div> : <span className="text-[12px] text-slate-400 dark:text-slate-500 italic">—</span>}</div>
                        <div><span className="text-[12px] font-bold text-violet-700 dark:text-violet-400">{issue.story_points ? `${issue.story_points}pts` : '—'}</span></div>
                        <div><span className={`text-[12px] ${issue.due_date && new Date(issue.due_date) < new Date() && issue.status !== 'done' ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>{issue.due_date ? new Date(issue.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'}</span></div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* ══ CALENDAR VIEW ═════════════════════════════════════ */}
          {activeTab === 'board' && viewMode === 'calendar' && (
            <div className="p-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm dark:shadow-slate-950 overflow-hidden">
                {/* Calendar nav */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() - 1))} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} className="px-3 py-1.5 text-[12px] font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg">Today</button>
                    <button onClick={() => setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() + 1))} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Grid */}
                <div className="grid grid-cols-7">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="py-2 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">{d}</div>
                  ))}
                  {getCalendarDays().map((day, i) => {
                    const ds = day.date.toISOString().split('T')[0];
                    const issues = (calendarData.calendar[ds] || []).concat(day.isToday ? calendarData.noDueDate : []);
                    const done = issues.filter(i => i.status === 'done').length;
                    return (
                      <div key={i} onClick={() => setSelectedDate(day.date)}
                        className={`min-h-[100px] p-2 border-b border-r border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                          !day.isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        } ${day.isToday ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''} ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-inset ring-orange-400 dark:ring-orange-500' : ''}`}
                      >
                        <div className={`text-[13px] font-bold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
                          day.isToday ? 'bg-orange-500 text-white' : day.isCurrentMonth ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'
                        }`}>{day.date.getDate()}</div>
                        {issues.length > 0 && (
                          <div className="space-y-1">
                            {issues.slice(0, 2).map(issue => (
                              <div key={issue.id} onClick={e => { e.stopPropagation(); setSelectedIssue(issue); setShowIssueDetails(true); }}
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate ${issue.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}
                              >{issue.key} · {issue.title}</div>
                            ))}
                            {issues.length > 2 && <p className="text-[10px] text-slate-400 dark:text-slate-500">+{issues.length - 2} more</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ BACKLOG VIEW ══════════════════════════════════════ */}
          {activeTab === 'backlog' && (
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-[15px] font-bold text-slate-900">Product Backlog <span className="text-slate-400 font-normal ml-1">({filteredIssues.length})</span></h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {filteredIssues.map((issue, i) => (
                    <motion.div key={issue.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                      onClick={() => { setSelectedIssue(issue); setShowIssueDetails(true); }}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/80 cursor-pointer group"
                    >
                      <IssueTypeIcon type={issue.type} />
                      <code className="text-[10px] font-mono text-slate-400 shrink-0">{issue.key}</code>
                      <p className="text-[13.5px] font-semibold text-slate-900 flex-1 truncate">{issue.title}</p>
                      <PriorityDot priority={issue.priority} />
                      <StatusPill status={issue.status} />
                      {issue.assignee_name ? <Avatar name={issue.assignee_name} size="xs" /> : <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-200" />}
                      <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ SPRINTS VIEW ══════════════════════════════════════ */}
          {activeTab === 'sprints' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {sprints.map((sprint, i) => {
                  const stateCfg = { active: { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }, future: { dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700 ring-blue-200' }, closed: { dot: 'bg-slate-300', badge: 'bg-slate-100 text-slate-500 ring-slate-200' } }[sprint.state];
                  return (
                    <motion.div key={sprint.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-slate-100/60 transition-all"
                    >
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${stateCfg.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-bold text-slate-900 truncate">{sprint.name}</h3>
                          {sprint.goal && <p className="text-[12px] text-slate-500 truncate mt-0.5">{sprint.goal}</p>}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${stateCfg.badge}`}>{sprint.state}</span>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {[{ label: 'Start', val: sprint.start_date || 'TBD' }, { label: 'End', val: sprint.end_date || 'TBD' }].map(({ label, val }) => (
                            <div key={label} className="bg-slate-50 rounded-xl px-3 py-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                              <p className="text-[12px] font-semibold text-slate-800 mt-0.5">{val}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] text-slate-500"><strong className="text-slate-900">{sprint.issue_count}</strong> issues</p>
                          <button onClick={() => { setSelectedSprint(sprint.id); setActiveTab('board'); }}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-orange-600 hover:text-orange-700 transition-colors"
                          >View Board <ArrowRight className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {/* New sprint CTA */}
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: sprints.length * 0.07 }}
                  onClick={() => setShowSprintModal(true)}
                  className="rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all hover:bg-slate-50/50"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center"><Plus className="w-5 h-5" /></div>
                  <p className="text-[13px] font-semibold">Create new sprint</p>
                </motion.button>
              </div>
            </div>
          )}

          {/* ══ REPORTS VIEW ══════════════════════════════════════ */}
          {activeTab === 'reports' && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Issues', value: total, icon: Layers, color: 'text-slate-600', bg: 'bg-slate-100', change: '+12%' },
                  { label: 'Completed', value: done, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+8%' },
                  { label: 'In Progress', value: boardData['in-progress'].length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', change: '+2' },
                  { label: 'Velocity (pts)', value: allIssues.filter(i=>i.status==='done').reduce((s,i)=>s+(i.story_points||0),0), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', change: '+15%' },
                ].map(({ label, value, icon: Icon, color, bg, change }) => (
                  <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{change}</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{value}</p>
                    <p className="text-[12px] text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Priority breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-4">Issues by Priority</h3>
                  <div className="space-y-3">
                    {(['highest','high','medium','low','lowest'] as const).map(p => {
                      const count = allIssues.filter(i => i.priority === p).length;
                      const pct = total ? (count / total) * 100 : 0;
                      const cfg = PRIORITY_CFG[p];
                      return (
                        <div key={p} className="flex items-center gap-3">
                          <span className="text-[12px] font-semibold text-slate-600 w-16 shrink-0">{cfg.label}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full ${cfg.bar}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                          </div>
                          <span className="text-[12px] font-bold text-slate-900 w-6 text-right shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-4">Issues by Type</h3>
                  <div className="space-y-3">
                    {(['story','task','bug','epic'] as const).map(t => {
                      const count = allIssues.filter(i => i.type === t).length;
                      const pct = total ? (count / total) * 100 : 0;
                      const cfg = TYPE_CFG[t];
                      return (
                        <div key={t} className="flex items-center gap-3">
                          <IssueTypeIcon type={t} />
                          <span className="text-[12px] font-semibold text-slate-600 w-14 shrink-0">{cfg.label}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full ${cfg.bg.replace('bg-','bg-').replace('-100','-400')}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                          </div>
                          <span className="text-[12px] font-bold text-slate-900 w-6 text-right shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODALS ════════════════════════════════════════════════ */}

      {/* Issue detail */}
      <AnimatePresence>
        {showIssueDetails && selectedIssue && (
          <IssueDetailModal issue={selectedIssue} onClose={() => { setShowIssueDetails(false); setSelectedIssue(null); }} />
        )}
      </AnimatePresence>

      {/* Create Issue */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
          >
            <motion.div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-700"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></div>
                  <div><h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Create Issue</h2><p className="text-[11px] text-slate-500 dark:text-slate-400">Add to {selectedSprint ? sprints.find(s=>s.id===selectedSprint)?.name || 'sprint' : 'backlog'}</p></div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Title *</label>
                  <input value={issueForm.title} onChange={e => setIssueForm({...issueForm, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[14px] font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                    placeholder="What needs to be done?" autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Description</label>
                  <textarea value={issueForm.description} onChange={e => setIssueForm({...issueForm, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 resize-none h-24 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                    placeholder="Add details, acceptance criteria, notes…"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Type', key: 'type', options: Object.entries(TYPE_CFG).map(([v,c]) => ({ value: v, label: c.label })) },
                    { label: 'Priority', key: 'priority', options: Object.entries(PRIORITY_CFG).map(([v,c]) => ({ value: v, label: `${c.icon} ${c.label}` })) },
                    { label: 'Assignee', key: 'assignee', options: [{value:'',label:'Unassigned'},...mockUsers.map(u=>({value:u.name,label:u.name}))] },
                  ].map(({ label, key, options }) => (
                    <div key={key}>
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
                      <select value={(issueForm as any)[key]} onChange={e => setIssueForm({...issueForm, [key]: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 bg-white dark:bg-slate-800"
                      >
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Story Points', key: 'story_points', type: 'number', placeholder: '5' },
                    { label: 'Due Date',     key: 'due_date',     type: 'date',   placeholder: '' },
                    { label: 'Est. Hours',   key: 'estimated_hours', type: 'number', placeholder: '8' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
                      <input type={type} value={(issueForm as any)[key]} onChange={e => setIssueForm({...issueForm, [key]: e.target.value})}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Labels <span className="text-slate-300 dark:text-slate-600 font-normal normal-case">(comma separated)</span></label>
                  <input value={issueForm.labels} onChange={e => setIssueForm({...issueForm, labels: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 bg-white dark:bg-slate-800"
                    placeholder="frontend, urgent, auth"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                <p className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><Kbd>⌘</Kbd><Kbd>↵</Kbd> to submit</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-[13px] font-semibold transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={createIssue} disabled={!issueForm.title.trim()}
                    className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[13px] font-bold hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >Create Issue</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Sprint */}
      <AnimatePresence>
        {showSprintModal && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowSprintModal(false); }}
          >
            <motion.div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center"><Rocket className="w-4 h-4 text-white" /></div>
                  <h2 className="text-[15px] font-bold text-slate-900">Create Sprint</h2>
                </div>
                <button onClick={() => setShowSprintModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Sprint Name', key: 'name', type: 'text', placeholder: 'Sprint 14 — Auth & Onboarding' },
                  { label: 'Sprint Goal', key: 'goal', type: 'textarea', placeholder: 'What will we achieve this sprint?' },
                  { label: 'Start Date', key: 'start_date', type: 'date', placeholder: '' },
                  { label: 'End Date',   key: 'end_date',   type: 'date', placeholder: '' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
                    {type === 'textarea'
                      ? <textarea value={(sprintForm as any)[key]} onChange={e => setSprintForm({...sprintForm, [key]: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none h-20"
                          placeholder={placeholder}
                        />
                      : <input type={type} value={(sprintForm as any)[key]} onChange={e => setSprintForm({...sprintForm, [key]: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-200"
                          placeholder={placeholder}
                        />
                    }
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                <button onClick={() => setShowSprintModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-[13px] font-semibold">Cancel</button>
                <button onClick={createSprint} disabled={!sprintForm.name}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-[13px] font-bold hover:from-orange-600 hover:to-red-600 disabled:opacity-40 transition-colors shadow-sm"
                >Create Sprint</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-40"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 px-6 py-4 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
              <span className="text-[14px] font-semibold text-slate-700">Loading…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}