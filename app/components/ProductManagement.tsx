'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, X, AlertCircle, Target, GitBranch, Calendar, CheckCircle, Clock, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { getToken } from '../lib/auth';

interface Issue {
  id: string;
  key: string;
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status: 'backlog' | 'selected' | 'in-progress' | 'done';
  assignee_name?: string;
  assignee_id?: string;
  reporter_id?: string;
  reporter_name?: string;
  sprint_id?: number | null;
  parent_id?: string | null;
  story_points?: number | null;
  labels: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  due_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
}

interface Sprint {
  id: number;
  name: string;
  goal: string;
  state: 'active' | 'future' | 'closed';
  start_date: string;
  end_date: string;
  issue_count: number;
}

interface BoardData {
  backlog: Issue[];
  selected: Issue[];
  'in-progress': Issue[];
  done: Issue[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Simple Issue Card Component with HTML5 Drag and Drop
function IssueCard({ 
  issue, 
  onDragStart, 
  onDragEnd,
  setSelectedIssue,
  setShowIssueDetails,
  getIssueIcon,
  getPriorityColor,
  getStatusColor
}: { 
  issue: Issue; 
  onDragStart: (issue: Issue) => void;
  onDragEnd: () => void;
  setSelectedIssue: (issue: Issue | null) => void;
  setShowIssueDetails: (show: boolean) => void;
  getIssueIcon: (type: Issue['type']) => React.ReactNode;
  getPriorityColor: (priority: Issue['priority']) => string;
  getStatusColor: (status: Issue['status']) => string;
}) {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Drag started:', issue.id);
    onDragStart(issue);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Drag ended');
    onDragEnd();
    e.currentTarget.style.opacity = '1';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
      onClick={() => {
        console.log('Issue card clicked:', issue.id);
        setSelectedIssue(issue);
        setShowIssueDetails(true);
      }}
    >
      {/* Header Row - Perfectly Aligned */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          {getIssueIcon(issue.type)}
          <span className="text-xs font-mono text-muted-foreground font-semibold whitespace-nowrap">{issue.key}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium leading-none border ${getPriorityColor(issue.priority)}`}>
            {issue.priority}
          </span>
        </div>
      </div>
      
      {/* Title - Bigger font for important info */}
      <h4 className="text-base font-bold text-foreground mb-2 line-clamp-2 leading-snug">{issue.title}</h4>
      
      {/* Description */}
      {issue.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{issue.description}</p>
      )}
      
      {/* Assignee & Points Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {issue.assignee_name ? (
            <>
              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-semibold text-primary border border-primary/20 flex-shrink-0">
                {issue.assignee_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground truncate">{issue.assignee_name}</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 border-2 border-dashed border-muted rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">?</span>
              </div>
              <span className="text-xs text-muted-foreground">Unassigned</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {issue.story_points && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold border border-primary/20 leading-none">
              {issue.story_points} pts
            </span>
          )}
        </div>
      </div>
      
      {/* Due Date - Shown below */}
      {issue.due_date && (
        <div className="flex items-center gap-1.5 mb-2 text-orange-600">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs font-medium">
                        {new Date(issue.due_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', year: 'numeric' }).replace(',', '')}
          </span>
        </div>
      )}
      
      {/* Labels - Compact & Aligned */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {issue.labels.map((label, idx) => (
            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-medium leading-none">
              {label}
            </span>
          ))}
        </div>
      )}
      
      {/* Time Tracking */}
      {(issue.estimated_hours || issue.actual_hours) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs">
          {issue.estimated_hours && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">Est {Number(issue.estimated_hours).toFixed(0)}h</span>
            </div>
          )}
          {issue.actual_hours && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="font-medium">Actual {Number(issue.actual_hours).toFixed(0)}h</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductManagement() {
  const router = useRouter();
  
  // Test if component is loading
  useEffect(() => {
    console.log('ProductManagement component mounted');
  }, []);

  // Initialize calendar to current month
  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);
  const [activeTab, setActiveTab] = useState<'board' | 'backlog' | 'sprints'>('board');
  const [boardData, setBoardData] = useState<BoardData>({
    backlog: [],
    selected: [],
    'in-progress': [],
    done: []
  });
  // Calendar data state
  const [calendarData, setCalendarData] = useState<{
    calendar: Record<string, Issue[]>;
    noDueDate: Issue[];
    totalIssues: number;
  }>({
    calendar: {},
    noDueDate: [],
    totalIssues: 0
  });
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);

  // Workspace state
  const [workspaces, setWorkspaces] = useState<{id: string, name: string}[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('default');
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  
  // Additional features state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar'>('board');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    type: 'task' as Issue['type'],
    priority: 'medium' as Issue['priority'],
    story_points: '',
    labels: '',
    assignee: '',
    due_date: '',
    estimated_hours: '',
    parent_id: ''
  });

  const [sprintForm, setSprintForm] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: ''
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    name: ''
  });

  const createWorkspace = async () => {
    if (!workspaceForm.name.trim()) return;
    
    const newWorkspace = {
      id: Date.now().toString(),
      name: workspaceForm.name.trim()
    };
    
    setWorkspaces([...workspaces, newWorkspace]);
    setSelectedWorkspace(newWorkspace.id);
    setWorkspaceForm({ name: '' });
    setShowWorkspaceModal(false);
  };

  // Mock users for assignee options
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com' },
    { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com' }
  ];

  const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'selected', title: 'Selected' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const handleDragStart = (issue: Issue) => {
    console.log('Drag started:', issue.id);
    setDraggedIssue(issue);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    setDraggedIssue(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    console.log('Dropped on:', targetStatus);
    
    if (draggedIssue && draggedIssue.status !== targetStatus) {
      console.log('Moving issue from', draggedIssue.status, 'to', targetStatus);
      await moveIssue(draggedIssue.id, targetStatus);
    }
    
    setDraggedIssue(null);
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/product${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      router.push('/login');
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }
    
    return response.json();
  };

  const loadBoard = async () => {
    try {
      setLoading(true);
      const params = selectedSprint ? `?sprint_id=${selectedSprint}` : '';
      const data = await apiRequest(`/board${params}`);
      if (data) setBoardData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load calendar data from new API
  const loadCalendar = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/calendar');
      if (data) {
        console.log('[FRONTEND] Calendar data loaded:', data);
        setCalendarData(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async () => {
    try {
      const data = await apiRequest('/sprints');
      if (data) {
        setSprints(data);
        const activeSprint = data.find((s: Sprint) => s.state === 'active');
        if (activeSprint && !selectedSprint) {
          setSelectedSprint(activeSprint.id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load sprints:', err);
    }
  };

  const createIssue = async () => {
    try {
      const labels = issueForm.labels.split(',').map(l => l.trim()).filter(Boolean);
      await apiRequest('/issues', {
        method: 'POST',
        body: JSON.stringify({
          ...issueForm,
          labels,
          story_points: issueForm.story_points ? parseInt(issueForm.story_points) : null,
          sprint_id: selectedSprint,
          status: 'backlog'
        })
      });
      setShowCreateModal(false);
      setIssueForm({ 
        title: '', 
        description: '', 
        type: 'task', 
        priority: 'medium', 
        story_points: '', 
        labels: '', 
        assignee: '',
        due_date: '',
        estimated_hours: '',
        parent_id: ''
      });
      loadBoard();
      loadSprints();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createSprint = async () => {
    try {
      await apiRequest('/sprints', {
        method: 'POST',
        body: JSON.stringify({ ...sprintForm, state: 'future' })
      });
      setShowSprintModal(false);
      setSprintForm({ name: '', goal: '', start_date: '', end_date: '' });
      loadSprints();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const moveIssue = async (issueId: string, newStatus: string) => {
    console.log(`[API CALL] Moving issue ${issueId} to status: ${newStatus}`);
    try {
      const token = getToken();
      const url = `${API_BASE_URL}/api/product/issues/${issueId}/move`;
      console.log(`[API CALL] URL: ${url}`);
      console.log(`[API CALL] Token: ${token ? 'Present' : 'Missing'}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      console.log(`[API CALL] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[API CALL] Error:', errorData);
        throw new Error(errorData.error || 'Failed to move issue');
      }
      
      const data = await response.json();
      console.log('[API CALL] Success:', data);
      
      // Reload board after successful move
      await loadBoard();
    } catch (err: any) {
      console.error('[API CALL] Exception:', err);
      setError(err.message);
    }
  };

  // Find which container an issue is in
  const findContainer = (id: string) => {
    for (const columnId of columns.map(c => c.id)) {
      const issues = boardData[columnId as keyof BoardData];
      if (issues.find((i: Issue) => i.id === id)) {
        return columnId;
      }
    }
    return null;
  };

  useEffect(() => { loadSprints(); }, []);
  useEffect(() => { if (activeTab === 'board') loadBoard(); }, [activeTab, selectedSprint]);
  useEffect(() => { if (activeTab === 'board' && viewMode === 'calendar') loadCalendar(); }, [activeTab, viewMode]);

  const getTypeLabel = (type: Issue['type']) => type.charAt(0).toUpperCase() + type.slice(1);

  const allIssues = [...boardData.backlog, ...boardData.selected, ...boardData['in-progress'], ...boardData.done];
  const filteredIssues = allIssues.filter(issue => 
    !searchQuery || issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper functions for use in both IssueCard and list view
  const getIssueIcon = (type: Issue['type']) => {
    const icons = {
      story: <div className="w-3 h-3 bg-blue-500 rounded-full" title="Story" />,
      task: <div className="w-3 h-3 bg-gray-500 rounded-full" title="Task" />,
      bug: <div className="w-3 h-3 bg-red-500 rounded-full" title="Bug" />,
      epic: <div className="w-3 h-3 bg-purple-500 rounded-full" title="Epic" />
    };
    return icons[type] || icons.task;
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    const colors = {
      highest: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200', 
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      lowest: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status: Issue['status']) => {
    const colors = {
      backlog: 'bg-gray-100 text-gray-700',
      selected: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-indigo-100 text-indigo-700',
      done: 'bg-green-100 text-green-700'
    };
    return colors[status] || colors.backlog;
  };

  // Calendar navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Get calendar days for current month view
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    console.log('[CALENDAR] Current month:', year, month, 'First day:', firstDay, 'Days in month:', daysInMonth);
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Current month days
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    console.log('[CALENDAR] Today:', today.toDateString(), 'Current month:', new Date(year, month, 1).toDateString());
    console.log('[CALENDAR] Today details:', todayYear, todayMonth, todayDate);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = year === todayYear && month === todayMonth && i === todayDate;
      
      if (isToday) {
        console.log('[CALENDAR] Found today at date:', i, date.toDateString());
      }
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  // Get issue status distribution for a specific date
  const getDateIssueStats = (dateStr: string, issuesToAnalyze?: Issue[]) => {
    // Use provided issues or fall back to filtering (for backwards compatibility)
    const dayIssues = issuesToAnalyze || allIssues.filter(issue => {
      // Use the same logic as calendar view
      if (issue.due_date) {
        return issue.due_date === dateStr;
      }
      // If no due date, show it on today's date
      const today = new Date();
      return dateStr === today.toISOString().split('T')[0];
    });
    const stats = {
      total: dayIssues.length,
      backlog: 0,
      selected: 0,
      'in-progress': 0,
      done: 0,
      resolved: 0,
      pending: 0
    };
    
    dayIssues.forEach(issue => {
      stats[issue.status]++;
      if (issue.status === 'done') {
        stats.resolved++;
      } else {
        stats.pending++;
      }
    });
    
    return stats;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Product Management</h1>
                  <p className="text-blue-100 text-sm">Jira-style project tracking and management</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <span className="text-white text-sm">Workspace:</span>
                  <select
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium focus:outline-none border-none"
                  >
                    <option value="default" className="text-slate-900">Default</option>
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id} className="text-slate-900">
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowWorkspaceModal(true)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all text-sm"
                >
                  ← Back to Tools
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-4">
            {/* Main Tabs */}
            <div className="flex gap-2 pb-4 border-b border-slate-200">
              {[
                { id: 'board', label: 'Board', icon: <Target className="w-4 h-4" /> },
                { id: 'backlog', label: 'Backlog', icon: <GitBranch className="w-4 h-4" /> },
                { id: 'sprints', label: 'Sprints', icon: <Calendar className="w-4 h-4" /> },
                { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
                { id: 'reports', label: 'Reports', icon: <AlertCircle className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Controls Row */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                {/* View Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  {[
                    { id: 'board', icon: <Target className="w-4 h-4" />, label: 'Board' },
                    { id: 'list', icon: <GitBranch className="w-4 h-4" />, label: 'List' },
                    { id: 'calendar', icon: <Calendar className="w-4 h-4" />, label: 'Calendar' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        console.log('Switching to view mode:', mode.id);
                        setViewMode(mode.id as any);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
                        viewMode === mode.id 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={mode.label}
                    >
                      {mode.icon}
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Priority</option>
                  <option value="highest">Highest</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="lowest">Lowest</option>
                </select>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 bg-white"
                  />
                </div>
              </div>
              
              {/* Create Button */}
              <div className="flex items-center">
                {activeTab === 'sprints' ? (
                  <button 
                    onClick={() => setShowSprintModal(true)} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create Sprint
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowCreateModal(true)} 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sprint Selector */}
        {activeTab === 'board' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Sprint:</span>
                <select
                  value={selectedSprint || ''}
                  onChange={(e) => setSelectedSprint(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-1 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Backlog (No Sprint)</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>{sprint.name} ({sprint.state})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>{boardData.done.length} Done</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><span>{boardData['in-progress'].length} In Progress</span></div>
                <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /><span>{boardData.backlog.length + boardData.selected.length} To Do</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Board View with HTML5 Drag and Drop */}
        {activeTab === 'board' && viewMode === 'board' && (
          <div className="bg-slate-50/50 rounded-xl p-4">
            <div className="grid grid-cols-4 gap-4">
              {columns.map((column) => {
                const issues = boardData[column.id as keyof BoardData];
                const columnColors = {
                  backlog: 'bg-gray-50/80 border-gray-200',
                  selected: 'bg-blue-50/80 border-blue-200',
                  'in-progress': 'bg-indigo-50/80 border-indigo-200',
                  done: 'bg-green-50/80 border-green-200'
                };
                
                return (
                  <div 
                    key={column.id} 
                    className={`bg-white rounded-xl border-2 ${columnColors[column.id as keyof typeof columnColors]} transition-all ${
                      draggedIssue ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm">{column.title}</h3>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium min-w-[1.5rem] text-center">
                          {issues.length}
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div 
                      className="p-3 space-y-3 min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id)}
                    >
                      {issues.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <GripVertical className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-500">No issues yet</p>
                          <p className="text-xs text-slate-400 mt-1">Drag issues here</p>
                        </div>
                      ) : (
                        issues
                          .filter((issue: Issue) => 
                            !searchQuery || issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            issue.key.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((issue: Issue) => (
                            <IssueCard 
                              key={issue.id} 
                              issue={issue}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              setSelectedIssue={setSelectedIssue}
                              setShowIssueDetails={setShowIssueDetails}
                              getIssueIcon={getIssueIcon}
                              getPriorityColor={getPriorityColor}
                              getStatusColor={getStatusColor}
                            />
                          ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === 'board' && viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Story Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {allIssues
                    .filter((issue: Issue) => 
                      !searchQuery || issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      issue.key.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((issue: Issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => {
                        setSelectedIssue(issue);
                        setShowIssueDetails(true);
                      }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getIssueIcon(issue.type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">{issue.key}</div>
                              <div className="text-sm text-slate-900 mt-1">{issue.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="capitalize text-sm text-slate-600">{issue.type}</span></td>
                        <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded border bg-slate-100 text-slate-700">{issue.priority}</span></td>
                        <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{issue.status}</span></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{issue.assignee_name || 'Unassigned'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{issue.story_points || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{issue.due_date ? new Date(issue.due_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', year: 'numeric' }).replace(',', '') : '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {activeTab === 'board' && viewMode === 'calendar' && (
          <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-slate-900">Calendar</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{allIssues.filter(i => i.status === 'done').length} completed</span>
                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-3"></div>
                    <span>{allIssues.filter(i => i.status !== 'done').length} pending</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigateMonth('prev')}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-slate-900 min-w-[160px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => navigateMonth('next')}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                  <button 
                    onClick={goToToday}
                    className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden shadow-sm">
                {/* Weekday Headers */}
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div key={day} className="bg-slate-100 px-3 py-3 text-center border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 tracking-wide">{day}</span>
                  </div>
                ))}
                
                {/* Calendar Days */}
                {getCalendarDays().map((day, index) => {
                  const dateStr = day.date.toISOString().split('T')[0];
                  // Use calendar data from API
                  const dayIssues = calendarData.calendar[dateStr] || [];
                  // For today, also show issues without due dates
                  const issuesToShow = day.isToday 
                    ? [...dayIssues, ...calendarData.noDueDate]
                    : dayIssues;
                  const stats = getDateIssueStats(dateStr, issuesToShow);
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                  
                  console.log(`[CALENDAR] Day ${day.date.getDate()}: isToday=${day.isToday}, issues=${issuesToShow.length}, fromAPI=${dayIssues.length}, noDueDate=${day.isToday ? calendarData.noDueDate.length : 0}`);
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[140px] p-3 cursor-pointer transition-all duration-200 ease-out rounded-xl border-2 ${
                        day.isCurrentMonth 
                          ? 'bg-card border-border hover:border-primary/30 hover:shadow-lg' 
                          : 'bg-muted/30 border-transparent text-muted-foreground'
                      } ${
                        day.isToday 
                          ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary ring-2 ring-primary/20' 
                          : ''
                      } ${
                        isSelected 
                          ? 'bg-gradient-to-br from-primary/15 to-primary/10 border-primary ring-2 ring-primary/30 shadow-lg' 
                          : ''
                      } group relative overflow-hidden`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      {/* Date Number */}
                      <div className={`text-lg font-bold mb-2 ${
                        day.isToday ? 'text-primary' : 
                        isSelected ? 'text-primary' : 
                        day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {day.date.getDate()}
                        {day.isToday && (
                          <span className="ml-2 text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>
                        )}
                      </div>
                      
                      {/* Issue Status Overview */}
                      {issuesToShow.length > 0 && (
                        <div className="space-y-2">
                          {/* Modern Progress Circle */}
                          <div className="flex items-center justify-center">
                            <div className="relative w-12 h-12">
                              <svg className="transform -rotate-90 w-12 h-12" viewBox="0 0 48 48">
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="20"
                                  stroke="hsl(var(--muted))"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="20"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 20}`}
                                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - stats.done / stats.total)}`}
                                  className="transition-all duration-700 ease-out"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                                {Math.round((stats.done / stats.total) * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          {/* Modern Status Badges */}
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {stats.done > 0 && (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium border border-green-200">
                                <CheckCircle className="w-3 h-3" />
                                {stats.done} done
                              </div>
                            )}
                            {stats['in-progress'] > 0 && (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
                                <Clock className="w-3 h-3" />
                                {stats['in-progress']} in progress
                              </div>
                            )}
                            {(stats.backlog + stats.selected) > 0 && (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium border border-orange-200">
                                <AlertCircle className="w-3 h-3" />
                                {stats.backlog + stats.selected} pending
                              </div>
                            )}
                          </div>
                          
                          {/* Issue Preview - Clean without redundant status */}
                          <div className="space-y-2">
                            {issuesToShow.slice(0, 2).map((issue) => (
                              <div
                                key={issue.id}
                                className="group/issue cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIssue(issue);
                                  setShowIssueDetails(true);
                                }}
                              >
                                <div className="text-sm p-2.5 rounded-xl truncate transition-all bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md">
                                  <div className="flex items-center gap-2">
                                    {getIssueIcon(issue.type)}
                                    <span className="truncate font-semibold text-slate-900">{issue.key}</span>
                                    <span className="truncate text-slate-600">{issue.title}</span>
                                    {!issue.due_date && (
                                      <span className="text-xs text-orange-500 ml-auto flex-shrink-0">📅</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {issuesToShow.length > 2 && (
                              <div className="text-xs text-slate-500 font-medium text-center py-1">
                                +{issuesToShow.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Empty State */}
                      {issuesToShow.length === 0 && day.isCurrentMonth && (
                        <div className="flex flex-col items-center justify-center h-24 text-slate-400">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-slate-200 transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium">No tasks</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Modal */}
            {selectedDate && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                  {(() => {
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    const dateIssues = calendarData.calendar[dateStr] || [];
                    const selectedIssues = selectedDate.toDateString() === new Date().toDateString()
                      ? [...dateIssues, ...calendarData.noDueDate]
                      : dateIssues;
                    const stats = getDateIssueStats(dateStr, selectedIssues);
                    
                    return (
                      <>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-xl font-semibold text-slate-900">
                                {selectedDate.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric'
                                }).replace(',', '')}
                              </h2>
                              <p className="text-sm text-slate-500 mt-1">
                                {selectedIssues.length} {selectedIssues.length === 1 ? 'issue' : 'issues'} scheduled
                              </p>
                            </div>
                            <button 
                              onClick={() => setSelectedDate(null)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                          {selectedIssues.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-500 text-lg">No issues scheduled for this date</p>
                              <p className="text-sm text-slate-400 mt-2">Select a different date or create a new issue</p>
                            </div>
                          ) : (
                            <>
                              {/* Status Summary Cards */}
                              <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                                  <div className="text-3xl font-bold text-orange-600">{stats.backlog + stats.selected}</div>
                                  <div className="text-sm text-orange-700 font-medium mt-1">Pending</div>
                                </div>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                                  <div className="text-3xl font-bold text-indigo-600">{stats['in-progress']}</div>
                                  <div className="text-sm text-indigo-700 font-medium mt-1">In Progress</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                  <div className="text-3xl font-bold text-green-600">{stats.done}</div>
                                  <div className="text-sm text-green-700 font-medium mt-1">Completed</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                  <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                                  <div className="text-sm text-blue-700 font-medium mt-1">Total</div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                                  <span className="font-medium">Progress</span>
                                  <span className="font-bold">{Math.round((stats.done / stats.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                  <div 
                                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${(stats.done / stats.total) * 100}%` }}
                                  />
                                </div>
                              </div>

                              {/* Issues List */}
                              <div>
                                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                  Issues ({selectedIssues.length})
                                </h4>
                                <div className="space-y-3">
                                  {selectedIssues.map((issue) => (
                                    <div 
                                      key={issue.id}
                                      className="group bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
                                      onClick={() => {
                                        setSelectedIssue(issue);
                                        setShowIssueDetails(true);
                                        setSelectedDate(null);
                                      }}
                                    >
                                      <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                          {getIssueIcon(issue.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-slate-900">{issue.key}</span>
                                            {issue.status === 'done' && (
                                              <CheckCircle className="w-5 h-5 text-green-600" />
                                            )}
                                            {!issue.due_date && (
                                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                                No due date
                                              </span>
                                            )}
                                          </div>
                                          <h5 className="text-base text-slate-900 font-medium mb-3">{issue.title}</h5>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                              {issue.status}
                                            </span>
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                              {issue.priority}
                                            </span>
                                            {issue.assignee_name && (
                                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Target className="w-3 h-3" />
                                                {issue.assignee_name}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="ml-2">
                                          <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backlog View */}
        {activeTab === 'backlog' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Product Backlog</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Issue</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Priority</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredIssues.map((issue: Issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">{getIssueIcon(issue.type)}<span className="text-sm font-mono text-slate-500">{issue.key}</span></div>
                        <div className="text-sm font-medium text-slate-900 mt-1 pl-5">{issue.title}</div>
                      </td>
                      <td className="px-6 py-4"><span className="capitalize text-sm text-slate-600">{getTypeLabel(issue.type)}</span></td>
                      <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded border bg-slate-100 text-slate-700">{issue.priority}</span></td>
                      <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{issue.status}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-600">{issue.assignee_name || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sprints View */}
        {activeTab === 'sprints' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sprints.map((sprint: Sprint) => (
              <div key={sprint.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{sprint.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{sprint.goal}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sprint.state === 'active' ? 'bg-green-100 text-green-700' : sprint.state === 'future' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>{sprint.state}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><p className="text-xs text-slate-500 uppercase">Start Date</p><p className="text-sm font-medium text-slate-900">{sprint.start_date || 'Not set'}</p></div>
                    <div><p className="text-xs text-slate-500 uppercase">End Date</p><p className="text-sm font-medium text-slate-900">{sprint.end_date || 'Not set'}</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs text-slate-500 uppercase">Issues</p><p className="text-sm font-medium text-slate-900">{sprint.issue_count} issues</p></div>
                    <button onClick={() => { setSelectedSprint(sprint.id); setActiveTab('board'); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Board →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Issue Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Create Issue</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                    <input 
                      type="text" 
                      value={issueForm.title} 
                      onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                      placeholder="Enter issue title" 
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Issue Key</label>
                    <input 
                      type="text" 
                      value={`PROD-${Math.floor(Math.random() * 1000)}`} 
                      disabled 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    value={issueForm.description} 
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 h-24 resize-none" 
                    placeholder="Provide a detailed description of the issue..."
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select 
                      value={issueForm.type} 
                      onChange={(e) => setIssueForm({ ...issueForm, type: e.target.value as Issue['type'] })} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="story">📖 Story</option>
                      <option value="task">✓ Task</option>
                      <option value="bug">🐛 Bug</option>
                      <option value="epic">🏗️ Epic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select 
                      value={issueForm.priority} 
                      onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value as Issue['priority'] })} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="highest">🔴 Highest</option>
                      <option value="high">🟠 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🔵 Low</option>
                      <option value="lowest">⚪ Lowest</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                    <select 
                      value={issueForm.assignee} 
                      onChange={(e) => setIssueForm({ ...issueForm, assignee: e.target.value })} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">👤 Unassigned</option>
                      {mockUsers.map((user) => (
                        <option key={user.id} value={user.name}>👤 {user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Story Points</label>
                    <input 
                      type="number" 
                      value={issueForm.story_points} 
                      onChange={(e) => setIssueForm({ ...issueForm, story_points: e.target.value })} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                      placeholder="e.g., 5" 
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input 
                      type="date" 
                      value={issueForm.due_date} 
                      onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Hours</label>
                    <input 
                      type="number" 
                      value={issueForm.estimated_hours} 
                      onChange={(e) => setIssueForm({ ...issueForm, estimated_hours: e.target.value })} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                      placeholder="e.g., 8" 
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Labels (comma separated)</label>
                  <input 
                    type="text" 
                    value={issueForm.labels} 
                    onChange={(e) => setIssueForm({ ...issueForm, labels: e.target.value })} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                    placeholder="frontend, bug, urgent, backend" 
                  />
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <div className="text-xs text-slate-500">
                    * Required fields
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setShowCreateModal(false)} 
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={createIssue} 
                      disabled={!issueForm.title.trim()} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Create Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Sprint Modal */}
        {showSprintModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Create Sprint</h2>
                <button onClick={() => setShowSprintModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sprint Name</label>
                  <input type="text" value={sprintForm.name} onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., Sprint 13" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sprint Goal</label>
                  <textarea value={sprintForm.goal} onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 h-20 resize-none" placeholder="What do we want to achieve?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input type="date" value={sprintForm.start_date} onChange={(e) => setSprintForm({ ...sprintForm, start_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input type="date" value={sprintForm.end_date} onChange={(e) => setSprintForm({ ...sprintForm, end_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowSprintModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={createSprint} disabled={!sprintForm.name} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create Sprint</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Workspace Modal */}
        {showWorkspaceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Create Workspace</h2>
                <button onClick={() => setShowWorkspaceModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
                  <input 
                    type="text" 
                    value={workspaceForm.name} 
                    onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                    placeholder="e.g., Marketing Team, Development" 
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowWorkspaceModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={createWorkspace} disabled={!workspaceForm.name.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create Workspace</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-40">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
