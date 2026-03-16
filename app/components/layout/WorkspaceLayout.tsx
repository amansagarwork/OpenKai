'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Target, ChevronLeft, ChevronRight, ChevronDown, Plus, Search, X,
  Kanban, Layers, List, BarChart3, Settings, Bell, Users, Zap, Code2,
  Link2, FileText, Hash, Terminal, Palette, Shield, Database, Globe,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  title: string;
  iconKey: string;
  toolType: 'product' | 'devtool';
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  minusurl: Link2,
  codehealth: FileText,
  json: Code2,
  base64: Hash,
  jwt: Shield,
  uuid: Database,
  terminal: Terminal,
  product: Target,
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  tab?: string;
  href?: string;
}

 const navItems: Record<WorkspaceLayoutProps['toolType'], NavItem[]> = {
  product: [
    { id: 'board', label: 'Board', icon: Kanban, tab: 'board' },
    { id: 'backlog', label: 'Backlog', icon: Layers, tab: 'backlog' },
    { id: 'list', label: 'List View', icon: List, tab: 'list' },
    { id: 'reports', label: 'Reports', icon: BarChart3, tab: 'reports' },
    { id: 'team', label: 'Team', icon: Users, tab: 'team' },
    { id: 'settings', label: 'Settings', icon: Settings, tab: 'settings' },
  ],
  devtool: [
    { id: 'minusurl', label: 'MinusURL', icon: Link2, href: '/minusurl', section: 'Developer' },
    { id: 'json', label: 'JSON Formatter', icon: Code2, href: '/json-formatter', section: 'Developer' },
    { id: 'base64', label: 'Base64 Tool', icon: Hash, href: '/base64-tool', section: 'Developer' },
    { id: 'jwt', label: 'JWT Decoder', icon: Shield, href: '/jwt-decoder', section: 'Developer' },
    { id: 'uuid', label: 'UUID Generator', icon: Database, href: '/uuid-generator', section: 'Developer' },
    { id: 'terminal', label: 'Terminal', icon: Terminal, href: '/terminal', section: 'Developer' },
    { id: 'codehealth', label: 'Code Health', icon: FileText, href: '/codehealth', section: 'Developer' },
  ],
 };

export default function WorkspaceLayout({ children, title, iconKey, toolType }: WorkspaceLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [activeTab, setActiveTab] = useState(toolType === 'product' ? 'board' : '');
  const [notifications, setNotifications] = useState(3);
  const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
  
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);
  
  const workspaces = [
    { id: 1, name: 'OpenKai Platform', type: 'product', color: 'from-orange-400 to-red-500' },
    { id: 2, name: 'Dev Tools Suite', type: 'devtool', color: 'from-blue-400 to-violet-500' },
    { id: 3, name: 'Code Analysis', type: 'devtool', color: 'from-emerald-400 to-cyan-500' },
  ];

  const ToolIcon = iconMap[iconKey] || FileText;

  const currentWorkspace = workspaces.find(w => w.type === toolType) || workspaces[0];

  const sections: { title: string | null; items: NavItem[] }[] = [];
  navItems[toolType].forEach((item) => {
    const t = item.section ?? null;
    const last = sections[sections.length - 1];
    if (!last || last.title !== t) sections.push({ title: t, items: [item] });
    else last.items.push(item);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target as Node)) {
        setShowWorkspaceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (item: any) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.tab) {
      setActiveTab(item.tab);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans p-3 gap-3 bg-slate-100">

      {/* ══ SIDEBAR ═══════════════════════════════════════════════ */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease }}
        className="shrink-0 bg-white rounded-2xl flex flex-col overflow-visible relative z-20 shadow-sm border border-slate-200/80"
      >

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shadow-orange-200 shrink-0">
            <Target className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-[13px] font-black text-slate-900 tracking-tight leading-none">OpenKai</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Workspace</p>
            </motion.div>
          )}
        </div>

        {/* ── Workspace selector ── */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b border-slate-100 shrink-0 relative" ref={workspaceDropdownRef}>
            <button
              onClick={() => { setShowWorkspaceDropdown(v => !v); setWorkspaceSearch(''); setShowAddWorkspace(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group"
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentWorkspace.color} flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="text-white text-[10px] font-black">{currentWorkspace.name.charAt(0)}</span>
              </div>
              <span className="text-[12px] font-semibold text-slate-700 flex-1 text-left truncate">{currentWorkspace.name}</span>
              <motion.div animate={{ rotate: showWorkspaceDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showWorkspaceDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 right-3 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50"
                >
                  {!showAddWorkspace ? (
                    <>
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={workspaceSearch}
                            onChange={e => setWorkspaceSearch(e.target.value)}
                            placeholder="Search workspaces..."
                            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2">
                        {workspaces
                          .filter(w => w.name.toLowerCase().includes(workspaceSearch.toLowerCase()))
                          .map(workspace => (
                            <button
                              key={workspace.id}
                              onClick={() => { 
                                if (workspace.type === 'product') router.push('/product-management');
                                else if (workspace.type === 'devtool') router.push('/codehealth');
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                currentWorkspace.id === workspace.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded bg-gradient-to-br ${workspace.color}`} />
                              <span className="text-[12px] font-medium text-slate-700">{workspace.name}</span>
                            </button>
                          ))}
                      </div>
                      <div className="p-2 border-t border-slate-100">
                        <button
                          onClick={() => setShowAddWorkspace(true)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[12px] font-medium text-slate-600">New workspace</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <button onClick={() => setShowAddWorkspace(false)}>
                          <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </button>
                        <span className="text-[12px] font-semibold text-slate-700">Create workspace</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Workspace name..."
                        className="w-full px-3 py-2 text-[12px] bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 mb-2"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button className="flex-1 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition-colors">Create</button>
                        <button onClick={() => setShowAddWorkspace(false)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 text-[11px] font-semibold rounded-lg transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {sections.map((section, si) => (
            <div key={`${section.title ?? 'root'}:${si}`} className={si > 0 ? 'pt-4' : ''}>
              {section.title && !sidebarCollapsed && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const { id, label, icon: Icon, tab, href } = item;
                const active = tab ? activeTab === tab : pathname === href;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNavClick({ tab, href })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-orange-400' : ''}`} />
                    {!sidebarCollapsed && <span className="text-[13px] font-semibold">{label}</span>}
                    {active && !sidebarCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                  </motion.button>
                );
              })}
            </div>
          ))}

          {/* Dev Tools section for product management */}
          {toolType === 'product' && !sidebarCollapsed && (
            <div className="pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Developer Tools</p>
              {navItems.devtool.slice(0, 4).map(({ id, label, icon: Icon, href }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick({ href })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname === href
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="shrink-0 border-t border-slate-100 p-2 space-y-1">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="text-[12px] font-medium">Back to Tools</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(v => !v)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0" />}
            {!sidebarCollapsed && <span className="text-[12px] font-medium">Collapse sidebar</span>}
          </button>
        </div>
      </motion.aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${toolType}:${iconKey}:${pathname}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease }}
            className="flex-1 overflow-auto h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
