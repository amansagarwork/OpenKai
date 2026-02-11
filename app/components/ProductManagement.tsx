'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Target, Calendar, GitBranch, Plus, Search, Clock, AlertCircle, CheckCircle, X, GripVertical } from 'lucide-react';
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
  reporter_name?: string;
  sprint_id?: number;
  labels: string[];
  story_points?: number;
  created_at: string;
  updated_at: string;
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

// Sortable Issue Card Component
function SortableIssueCard({ issue }: { issue: Issue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id, data: { issue } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'story': return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'task': return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
      case 'bug': return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      case 'epic': return <div className="w-3 h-3 bg-purple-500 rounded-full" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'highest': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'lowest': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-400" />
          {getIssueIcon(issue.type)}
          <span className="text-xs font-mono text-slate-500">{issue.key}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(issue.priority)}`}>
          {issue.priority}
        </span>
      </div>
      <h4 className="text-sm font-medium text-slate-900 mb-2 pl-6">{issue.title}</h4>
      <div className="flex items-center justify-between pl-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {issue.assignee_name && (
            <span className="bg-slate-100 px-2 py-0.5 rounded">{issue.assignee_name}</span>
          )}
        </div>
        {issue.story_points && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{issue.story_points} pts</span>
        )}
      </div>
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pl-6">
          {issue.labels.slice(0, 3).map((label: string, idx: number) => (
            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{label}</span>
          ))}
          {issue.labels.length > 3 && <span className="text-xs text-slate-400">+{issue.labels.length - 3}</span>}
        </div>
      )}
    </div>
  );
}

// Issue Card for Drag Overlay
function IssueCard({ issue }: { issue: Issue }) {
  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'story': return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'task': return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
      case 'bug': return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      case 'epic': return <div className="w-3 h-3 bg-purple-500 rounded-full" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'highest': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'lowest': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg rotate-2 cursor-grabbing w-[280px]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-400" />
          {getIssueIcon(issue.type)}
          <span className="text-xs font-mono text-slate-500">{issue.key}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(issue.priority)}`}>
          {issue.priority}
        </span>
      </div>
      <h4 className="text-sm font-medium text-slate-900 mb-2 pl-6">{issue.title}</h4>
      <div className="flex items-center justify-between pl-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {issue.assignee_name && <span className="bg-slate-100 px-2 py-0.5 rounded">{issue.assignee_name}</span>}
        </div>
        {issue.story_points && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{issue.story_points} pts</span>
        )}
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'board' | 'backlog' | 'sprints'>('board');
  const [boardData, setBoardData] = useState<BoardData>({
    backlog: [],
    selected: [],
    'in-progress': [],
    done: []
  });
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    type: 'task' as Issue['type'],
    priority: 'medium' as Issue['priority'],
    story_points: '',
    labels: ''
  });

  const [sprintForm, setSprintForm] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: ''
  });

  const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'selected', title: 'Selected' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      setIssueForm({ title: '', description: '', type: 'task', priority: 'medium', story_points: '', labels: '' });
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
    try {
      await apiRequest(`/issues/${issueId}/move`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus, sprint_id: selectedSprint })
      });
      loadBoard();
    } catch (err: any) {
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = overId in boardData ? overId : findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setBoardData((prev) => {
      const activeItems = prev[activeContainer as keyof BoardData];
      const overItems = prev[overContainer as keyof BoardData];
      const activeIndex = activeItems.findIndex((i: Issue) => i.id === activeId);
      const overIndex = overItems.findIndex((i: Issue) => i.id === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length;
      } else {
        const isBelowOverItem = over && active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
      }

      const activeIssue = { ...activeItems[activeIndex], status: overContainer as Issue['status'] };

      return {
        ...prev,
        [activeContainer]: activeItems.filter((i: Issue) => i.id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeIssue,
          ...overItems.slice(newIndex)
        ]
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = overId in boardData ? overId : findContainer(overId);

    if (activeContainer && overContainer) {
      if (activeContainer !== overContainer) {
        await moveIssue(activeId, overContainer);
      } else if (activeId !== overId) {
        const columnId = activeContainer as keyof BoardData;
        const oldIndex = boardData[columnId].findIndex((i: Issue) => i.id === activeId);
        const newIndex = boardData[columnId].findIndex((i: Issue) => i.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          setBoardData((prev) => ({
            ...prev,
            [columnId]: arrayMove(prev[columnId], oldIndex, newIndex),
          }));
        }
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } }
    })
  };

  useEffect(() => { loadSprints(); }, []);
  useEffect(() => { if (activeTab === 'board') loadBoard(); }, [activeTab, selectedSprint]);

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'highest': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'lowest': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: Issue['type']) => type.charAt(0).toUpperCase() + type.slice(1);

  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'story': return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'task': return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
      case 'bug': return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      case 'epic': return <div className="w-3 h-3 bg-purple-500 rounded-full" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const allIssues = [...boardData.backlog, ...boardData.selected, ...boardData['in-progress'], ...boardData.done];
  const filteredIssues = allIssues.filter(issue => 
    !searchQuery || issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeIssue = activeId ? allIssues.find(i => i.id === activeId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Product Management</h1>
                <p className="text-blue-200 text-sm">Jira-style project tracking and management</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Back to Tools
            </button>
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
          <div className="flex items-center justify-between p-1">
            <div className="flex gap-1">
              {[
                { id: 'board', label: 'Board', icon: <Target className="w-4 h-4" /> },
                { id: 'backlog', label: 'Backlog', icon: <GitBranch className="w-4 h-4" /> },
                { id: 'sprints', label: 'Sprints', icon: <Calendar className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 pr-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {activeTab === 'sprints' ? (
                <button onClick={() => setShowSprintModal(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" /> Create Sprint
                </button>
              ) : (
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" /> Create Issue
                </button>
              )}
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

        {/* Board View with @dnd-kit */}
        {activeTab === 'board' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-4 gap-4">
              {columns.map((column) => (
                <div key={column.id} className="bg-slate-100 rounded-xl">
                  <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-xl">
                    <h3 className="font-semibold text-slate-900">{column.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{boardData[column.id as keyof BoardData].length} issues</p>
                  </div>
                  <SortableContext
                    items={boardData[column.id as keyof BoardData].map((i: Issue) => i.id)}
                    strategy={verticalListSortingStrategy}
                    id={column.id}
                  >
                    <div className="p-3 space-y-3 min-h-[500px] rounded-b-xl">
                      {boardData[column.id as keyof BoardData]
                        .filter((issue: Issue) => 
                          !searchQuery || issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.key.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((issue: Issue) => (
                          <SortableIssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
              {activeIssue ? <IssueCard issue={activeIssue} /> : null}
            </DragOverlay>
          </DndContext>
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
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(issue.priority)}`}>{issue.priority}</span></td>
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${issue.status === 'done' ? 'bg-green-100 text-green-700' : issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{issue.status}</span></td>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input type="text" value={issueForm.title} onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter issue title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 h-24 resize-none" placeholder="Enter description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select value={issueForm.type} onChange={(e) => setIssueForm({ ...issueForm, type: e.target.value as Issue['type'] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500">
                      <option value="story">Story</option><option value="task">Task</option><option value="bug">Bug</option><option value="epic">Epic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select value={issueForm.priority} onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value as Issue['priority'] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500">
                      <option value="highest">Highest</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="lowest">Lowest</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Story Points</label>
                    <input type="number" value={issueForm.story_points} onChange={(e) => setIssueForm({ ...issueForm, story_points: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Labels (comma separated)</label>
                    <input type="text" value={issueForm.labels} onChange={(e) => setIssueForm({ ...issueForm, labels: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="frontend, bug, urgent" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={createIssue} disabled={!issueForm.title} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create Issue</button>
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
