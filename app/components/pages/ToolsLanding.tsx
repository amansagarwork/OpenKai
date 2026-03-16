'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  FileText, Link2, Terminal, Code, Sparkles, Shuffle, FileJson, Shield,
  Unlock, Globe, Hash, Bug, Code2, Palette, FileSpreadsheet, Type, Target,
  ArrowRight, Star, LogIn, TrendingUp, Zap, Heart, Search, Filter,
  Grid3X3, List, ChevronRight, Users, Clock, CheckCircle2, Layers,
  BarChart3, GitBranch, Package, Cpu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getToken } from '../../lib/auth';
import FeaturedSection from '../sections/FeaturedSection';
import { PageLoader } from '../ui/AppleLoader';

/* ─── icon map ─────────────────────────────────────────────── */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Link2, Terminal, Code, Sparkles, Shuffle, FileJson, Shield,
  Unlock, Globe, Hash, Bug, Code2, Palette, FileSpreadsheet, Type, Target,
};

const getCategoryStyle = (cat: string) => {
  const map: Record<string, { dot: string; badge: string }> = {
    development:  { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 ring-blue-100'    },
    utility:      { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 ring-violet-100' },
    security:     { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    productivity: { dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 ring-orange-100'  },
    paste:        { dot: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700 ring-cyan-100'       },
    url:          { dot: 'bg-pink-500',    badge: 'bg-pink-50 text-pink-700 ring-pink-100'       },
    data:         { dot: 'bg-lime-500',    badge: 'bg-lime-50 text-lime-700 ring-lime-100'       },
  };
  return map[cat] ?? { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 ring-slate-100' };
};

const categoryLabels: Record<string, string> = {
  All: 'All',
  development: 'DevTools',
  utility: 'Utilities',
  security: 'Security',
  productivity: 'Productivity',
  paste: 'Paste',
  url: 'URL',
  data: 'Data',
};

/* ─── animation helpers ────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0  },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
});

function InView({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
      className={className}
    >{children}</motion.div>
  );
}

/* ─── Product Management Hero Card ─────────────────────────── */
function ProductManagementHero({ onClick }: { onClick: () => void }) {
  const tasks = [
    { label: 'Design system audit',    done: true,  assignee: 'AM', tag: 'Design',   color: 'bg-violet-100 text-violet-700' },
    { label: 'API rate limiting impl', done: true,  assignee: 'KR', tag: 'Backend',  color: 'bg-blue-100 text-blue-700'    },
    { label: 'Mobile nav refactor',    done: false, assignee: 'SP', tag: 'Frontend', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Analytics dashboard',    done: false, assignee: 'AM', tag: 'Product',  color: 'bg-orange-100 text-orange-700'  },
  ];

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative rounded-3xl overflow-hidden cursor-pointer group col-span-full lg:col-span-2 row-span-2"
    >
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Glow orbs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-colors duration-500" />
      <div className="absolute -bottom-16 -left-8 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl" />

      <div className="relative p-7 h-full flex flex-col min-h-[420px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-widest">Hero Feature</p>
                <h3 className="text-xl font-bold text-white leading-tight">Product Management</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Ship faster. Track everything. Connect your team — built for developers who manage products.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live
          </div>
        </div>

        {/* Mini Kanban */}
        <div className="flex-1 space-y-2.5 mb-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Sprint Progress — Q1 2026</p>
          {tasks.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/6 border border-white/8 hover:bg-white/10 transition-colors group/task"
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <p className={`flex-1 text-[13px] font-medium ${t.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{t.label}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.color}`}>{t.tag}</span>
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">{t.assignee}</div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Tasks Done', value: '24/31', icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Team Members', value: '8',   icon: Users,        color: 'text-blue-400'    },
            { label: 'Days Left',   value: '12',   icon: Clock,        color: 'text-orange-400'  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="px-3 py-2.5 rounded-xl bg-white/6 border border-white/8 text-center">
              <Icon className={`w-3.5 h-3.5 ${color} mx-auto mb-1`} />
              <p className="text-white font-bold text-base leading-none">{value}</p>
              <p className="text-slate-500 text-[10px] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40">
          Open Product Manager <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Tool Card ─────────────────────────────────────────────── */
function ToolCard({ service, isFav, onToggleFav, view }: {
  service: any; isFav: boolean; onToggleFav: () => void; view: 'grid' | 'list';
}) {
  const router = useRouter();
  const Icon = ICONS[service.icon] || FileText;
  const style = getCategoryStyle(service.category);

  if (view === 'list') return (
    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.18 }}
      onClick={() => router.push(service.href)}
      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/60 transition-all cursor-pointer group"
    >
      <div className={`w-9 h-9 rounded-xl ${service.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-4.5 h-4.5 ${service.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-slate-900">{service.name}</p>
        <p className="text-[12px] text-slate-400 truncate">{service.description}</p>
      </div>
      <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${style.badge}`}>{categoryLabels[service.category]}</span>
      <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
      >
        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      </button>
      <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </motion.div>
  );

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      onClick={() => router.push(service.href)}
      className="relative flex flex-col p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/70 transition-all cursor-pointer group overflow-hidden"
    >
      {/* Subtle bg tint on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

      <div className="relative flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-2xl ${service.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${service.iconColor}`} />
        </div>
        <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300 group-hover:text-slate-400'}`} />
        </button>
      </div>

      <div className="relative flex-1">
        <h3 className="text-[14px] font-bold text-slate-900 mb-1">{service.name}</h3>
        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">{service.description}</p>
      </div>

      <div className="relative flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${style.badge}`}>{categoryLabels[service.category]}</span>
        <div className="flex items-center gap-1 text-slate-300 group-hover:text-slate-500 transition-colors">
          <span className="text-[11px] font-medium">Open</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ToolsLanding() {
  const router = useRouter();
  const token = getToken();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'development', 'utility', 'security', 'productivity', 'paste', 'url', 'data'];

  useEffect(() => {
    if (token) fetchFavorites();
    fetchServices();
  }, [token]);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/services`);
      if (res.ok) setServices(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setFavorites(new Set(d.favorites?.map((f: any) => f.id) ?? []));
      }
    } catch (e) { console.error(e); }
  };

  const handleToggleFav = async (id: string, name: string) => {
    if (!token) { setShowLoginPrompt(true); return; }
    const isFav = favorites.has(id);
    try {
      if (isFav) {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/favorites/${id}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(p => { const n = new Set(p); n.delete(id); return n; });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id, type: 'tool', title: name, slug: id }),
        });
        setFavorites(p => new Set(p).add(id));
      }
    } catch (e) { console.error(e); }
  };

  const filtered = services.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f8f7]">
      <div className="max-w-6xl mx-auto px-4 pb-16 pt-2">

        {/* ── Featured (algorithm-powered) ── */}
        <FeaturedSection />

        {/* ── Hero feature row ── */}
        <InView className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Product Management Hero */}
            <ProductManagementHero onClick={() => router.push('/product-management')} />

            {/* Right column — quick stats + top shortcuts */}
            <div className="flex flex-col gap-4">
              {/* Quick Stats */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Platform Stats</p>
                <div className="space-y-3">
                  {[
                    { icon: Package,  label: 'Total Tools',   value: '17+', bar: 85,  color: 'bg-blue-500'    },
                    { icon: Users,    label: 'Active Users',  value: '1K+', bar: 60,  color: 'bg-violet-500'  },
                    { icon: BarChart3,label: 'Daily Launches',value: '24',  bar: 45,  color: 'bg-orange-500'  },
                    { icon: GitBranch,label: 'Integrations',  value: '8',   bar: 30,  color: 'bg-emerald-500' },
                  ].map(({ icon: Icon, label, value, bar, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-slate-600">{label}</span>
                          <span className="text-[12px] font-bold text-slate-900">{value}</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div className={`h-full rounded-full ${color}`}
                            initial={{ width: 0 }} animate={{ width: `${bar}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick launch chips */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Launch</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Code Health', icon: Cpu,       href: '/codehealth',  bg: 'bg-indigo-50', ic: 'text-indigo-600' },
                    { label: 'Terminal',    icon: Terminal,  href: '/terminal',    bg: 'bg-slate-100', ic: 'text-slate-700'  },
                    { label: 'JSON',        icon: FileJson,  href: '/json-formatter', bg: 'bg-emerald-50', ic: 'text-emerald-600' },
                    { label: 'MinusURL',    icon: Link2,     href: '/minusurl',    bg: 'bg-violet-50', ic: 'text-violet-600' },
                  ].map(({ label, icon: Icon, href, bg, ic }) => (
                    <button key={label} onClick={() => router.push(href)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${bg} hover:opacity-80 transition-opacity text-left group`}
                    >
                      <Icon className={`w-4 h-4 ${ic} shrink-0`} />
                      <span className={`text-[12px] font-semibold ${ic}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </InView>

        {/* ── All Tools Section ── */}
        <InView>
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">All Tools</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">{filtered.length} tools available</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tools…"
                  className="pl-8 pr-4 py-2 text-[13px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 w-44 placeholder:text-slate-400"
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200">
                {(['grid', 'list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`p-1.5 rounded-lg transition-colors ${view === v ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {v === 'grid' ? <Grid3X3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {categories.map(cat => {
              const style = cat !== 'All' ? getCategoryStyle(cat) : null;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all border ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {style && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
                  {categoryLabels[cat]}
                </button>
              );
            })}
          </div>

          {/* Tool cards */}
          {loading ? (
            <PageLoader text="Loading tools..." color="orange" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${activeCategory}-${view}-${search}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}
              >
                {filtered.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                  >
                    <ToolCard service={s} isFav={favorites.has(s.id)} onToggleFav={() => handleToggleFav(s.id, s.name)} view={view} />
                  </motion.div>
                ))}

                {/* Coming soon */}
                {view === 'grid' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: filtered.length * 0.04 }}
                    className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-5 flex flex-col items-center justify-center text-center min-h-[140px]"
                  >
                    <Layers className="w-6 h-6 text-slate-300 mb-2" />
                    <p className="text-[13px] font-semibold text-slate-500">More coming soon</p>
                    <p className="text-[11px] text-slate-400 mt-1">New tools drop regularly</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Discover CTA */}
          <div className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-center">
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px,white 1px,transparent 0)', backgroundSize: '24px 24px' }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[12px] font-medium mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> Algorithm-Powered Discovery
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Find Your Perfect Workflow</h3>
              <p className="text-slate-400 text-[14px] max-w-sm mx-auto mb-6">
                Personalised tool recommendations based on your usage patterns.
              </p>
              <button onClick={() => router.push('/discover')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-[14px] hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg shadow-orange-500/30"
              >
                <Zap className="w-4 h-4" /> Go to Discover
              </button>
            </div>
          </div>
        </InView>
      </div>

      {/* Login Prompt */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 max-w-sm w-full"
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Login Required</h3>
                  <p className="text-[12px] text-slate-500">To save your favourites</p>
                </div>
              </div>
              <p className="text-[13px] text-slate-600 mb-5 leading-relaxed">
                Sign in to save favourites, track usage, and get personalised recommendations.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold transition-colors">
                  Cancel
                </button>
                <button onClick={() => { router.push('/login'); setShowLoginPrompt(false); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-[13px] font-semibold transition-colors">
                  Log in
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}