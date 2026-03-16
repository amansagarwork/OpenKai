'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Target, ArrowRight, CheckCircle2, Users, Clock, Zap, Star,
  GitBranch, BarChart3, Package, Layers, TrendingUp, Code,
  FileText, Link2, Terminal, FileJson, Shield, Hash, Sparkles,
  ChevronRight, Play, Globe, MessageSquare, Cpu, ArrowUpRight,
  Calendar, Flag, Kanban, Activity, Eye, MousePointer, Heart,
  Rocket, Sparkles as SparklesIcon, Waves, Wind,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CobeGlobe from './components/ui/CobeGlobe';

/* ─── animation helpers ────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >{children}</motion.div>
  );
}

/* ─── Interactive Cursor ─────────────────────────────────── */
function Cursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const y = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX - 12);
      mouseY.set(e.clientY - 12);
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 bg-orange-500 rounded-full pointer-events-none z-50 mix-blend-difference"
      style={{ x, y }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}

/* ─── Floating Elements ──────────────────────────────────── */
function FloatingElements() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; left: string; top: string; duration: number; delay: number }>>([]);
  const [icons, setIcons] = useState<Array<{ id: number; x: number; left: string }>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate random positions only on client
    setParticles(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 10,
    })));
    setIcons(Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      left: Math.random() * 100 + '%',
    })));
  }, []);

  if (!mounted) {
    return null; // Don't render on server to avoid hydration mismatch
  }

  return (
    <>
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed w-1 h-1 bg-orange-300/30 rounded-full pointer-events-none"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 0,
          }}
          animate={{
            y: [null, -100],
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
          style={{
            left: particle.left,
            top: particle.top,
          }}
        />
      ))}

      {/* Floating icons */}
      {[
        { Icon: Code, delay: 0, color: 'text-blue-400' },
        { Icon: Zap, delay: 2, color: 'text-orange-400' },
        { Icon: SparklesIcon, delay: 4, color: 'text-purple-400' },
        { Icon: Heart, delay: 6, color: 'text-red-400' },
        { Icon: Rocket, delay: 8, color: 'text-green-400' },
      ].map(({ Icon, delay, color }, i) => (
        <motion.div
          key={i}
          className={`fixed pointer-events-none ${color} opacity-20`}
          initial={{
            x: icons[i]?.x || 0,
            y: window.innerHeight + 100,
            rotate: 0,
          }}
          animate={{
            y: -100,
            rotate: 360,
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            delay,
            ease: 'linear',
          }}
          style={{
            left: icons[i]?.left || '0%',
          }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      ))}
    </>
  );
}

/* ─── Utility for className merging ──────────────────────── */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Enhanced Animated counter ───────────────────────────── */
function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  const started = useRef(false);

  if (visible && !started.current) {
    started.current = true;
    const duration = 2000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setVal(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ─── Live product board preview ──────────────────────────── */
function ProductBoardPreview() {
  const columns = [
    {
      title: 'Backlog',
      color: 'bg-slate-100',
      dot: 'bg-slate-400',
      items: [
        { title: 'Dark mode toggle', priority: 'Low',  tag: 'UX',      avatar: 'JK' },
        { title: 'CSV export',       priority: 'Med',  tag: 'Feature',  avatar: 'SP' },
      ],
    },
    {
      title: 'In Progress',
      color: 'bg-blue-50',
      dot: 'bg-blue-500',
      items: [
        { title: 'Auth 2FA flow',    priority: 'High', tag: 'Security', avatar: 'AM' },
        { title: 'Webhook system',   priority: 'High', tag: 'Backend',  avatar: 'KR' },
      ],
    },
    {
      title: 'Done',
      color: 'bg-emerald-50',
      dot: 'bg-emerald-500',
      items: [
        { title: 'API rate limits',  priority: 'Med',  tag: 'Backend',  avatar: 'KR' },
        { title: 'Onboarding flow',  priority: 'High', tag: 'Product',  avatar: 'AM' },
      ],
    },
  ];

  const priorityColor: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-500',
    Med: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-600',
  };
  const tagColor: Record<string, string> = {
    UX: 'bg-violet-100 text-violet-700',
    Feature: 'bg-blue-100 text-blue-700',
    Security: 'bg-red-100 text-red-600',
    Backend: 'bg-slate-100 text-slate-700',
    Product: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="grid grid-cols-3 gap-3 h-full">
      {columns.map((col, ci) => (
        <div key={col.title} className={`${col.color} dark:bg-slate-800/50 rounded-2xl p-3 flex flex-col gap-2`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{col.title}</span>
            <span className="ml-auto text-[10px] font-semibold text-slate-400 dark:text-slate-500">{col.items.length}</span>
          </div>
          {col.items.map((item, ii) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.1 + ii * 0.08 + 0.3 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-2.5 shadow-sm dark:shadow-slate-950 border border-white/80 dark:border-slate-600"
            >
              <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 mb-2 leading-snug">{item.title}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${priorityColor[item.priority]}`}>{item.priority}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tagColor[item.tag] ?? 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400'}`}>{item.tag}</span>
                <div className="ml-auto w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">{item.avatar}</div>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const features = [
    {
      icon: Kanban,
      title: 'Kanban Boards',
      desc: 'Drag-and-drop task management with custom columns, priorities and assignees.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      desc: 'Invite developers, designers and PMs. Everyone on the same page.',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: Calendar,
      title: 'Sprint Planning',
      desc: 'Time-box work into sprints. Track velocity and never miss a deadline.',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      desc: 'Burndown charts, cycle time, throughput — insights that actually matter.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: GitBranch,
      title: 'Code Integration',
      desc: 'Link tasks to commits, PRs and branches. Ship code with confidence.',
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      icon: MessageSquare,
      title: 'In-Context Comments',
      desc: 'Discuss tasks right where work happens. No more Slack threads.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];

  const tools = [
    { name: 'Code Health',  icon: Cpu,      href: '/codehealth',      bg: 'bg-indigo-50',  ic: 'text-indigo-600',  desc: 'Analyse quality' },
    { name: 'OpenPaste',    icon: FileText,  href: '/open-kai',        bg: 'bg-blue-50',    ic: 'text-blue-600',    desc: 'Share snippets'  },
    { name: 'MinusURL',     icon: Link2,     href: '/minusurl',        bg: 'bg-violet-50',  ic: 'text-violet-600',  desc: 'Shorten links'   },
    { name: 'Terminal',     icon: Terminal,  href: '/terminal',        bg: 'bg-slate-900',  ic: 'text-white',       desc: 'Run commands'    },
    { name: 'JSON Format',  icon: FileJson,  href: '/json-formatter',  bg: 'bg-emerald-50', ic: 'text-emerald-600', desc: 'Format & validate'},
    { name: 'Password Gen', icon: Shield,    href: '/password-generator', bg: 'bg-rose-50', ic: 'text-rose-600',   desc: 'Secure passwords' },
    { name: 'Hash Gen',     icon: Hash,      href: '/hash-generator',  bg: 'bg-lime-50',    ic: 'text-lime-600',    desc: 'Generate hashes' },
    { name: 'UUID',         icon: Sparkles,  href: '/uuid-generator',  bg: 'bg-pink-50',    ic: 'text-pink-600',    desc: 'Unique IDs'      },
  ];

  const testimonials = [
    { name: 'Aryan M.',   role: 'Lead Engineer',        text: 'OpenKai replaced 3 different tools for our team. The product manager alone is worth the switch.',       avatar: 'AM' },
    { name: 'Shreya P.',  role: 'Product Manager',      text: 'Finally a PM tool made by developers, for developers. The code integration feature is 🔥.',             avatar: 'SP' },
    { name: 'Kiran R.',   role: 'Full Stack Developer',  text: 'The all-in-one toolkit saved us so much context-switching. We ship 40% faster now.',                   avatar: 'KR' },
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Floating Elements */}
      <FloatingElements />

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-100/40 dark:from-orange-900/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-50/60 dark:from-blue-900/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <div>
              <motion.div {...{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease } }}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 text-[12px] font-bold mb-6">
                  <Zap className="w-3.5 h-3.5" />
                  The all-in-one developer productivity platform
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease }}
                className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 leading-[1.06] tracking-tight mb-6"
              >
                Ship products<br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">faster</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <defs><linearGradient id="g" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f97316"/><stop offset="1" stopColor="#ef4444"/>
                    </linearGradient></defs>
                  </svg>
                </span>
                {' '}together.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18, ease }}
                className="text-[17px] text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-lg"
              >
                OpenKai brings product management, developer tools, and team collaboration into one seamless platform. Less switching, more shipping.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.26, ease }}
                className="flex flex-wrap gap-3"
              >
                <button onClick={() => router.push('/register')}
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[15px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xl shadow-slate-900/20 dark:shadow-slate-950/20"
                >
                  <Star className="w-4 h-4 text-amber-300" />
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => router.push('/product-management')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[15px] hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Play className="w-4 h-4 text-orange-500" />
                  See it in action
                </button>
              </motion.div>

              {/* Social proof row */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4, ease }}
                className="flex items-center gap-4 mt-8"
              >
                <div className="flex -space-x-2">
                  {['AM','KR','SP','JK','PR'].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-[9px] font-bold">{i}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {Array.from({length:5}).map((_,i)=><Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400"/>)}
                    <span className="text-[12px] font-bold text-slate-900 dark:text-slate-100 ml-1">4.9</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Loved by <strong className="text-slate-700 dark:text-slate-300">1,000+</strong> developers</p>
                </div>
              </motion.div>
            </div>

            {/* Right — Interactive 3D Globe */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }}
              className="relative"
            >
              {/* Globe Container */}
              <div className="relative w-96 h-96 mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-blue-400/20 rounded-full blur-3xl scale-150" />

                {/* Globe */}
                <motion.div
                  className="relative w-full h-full rounded-full overflow-hidden border border-white/20 shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <CobeGlobe className="w-full h-full" />

                  {/* Overlay with stats */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, duration: 0.6 }}
                      className="text-center text-white"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Globe className="w-5 h-5" />
                        <span className="text-sm font-semibold">Global Reach</span>
                      </div>
                      <p className="text-2xl font-bold"><Counter to={50} suffix="+" /></p>
                      <p className="text-xs opacity-80">Countries</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Floating data points */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-16 right-16 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-950 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live Users</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100"><Counter to={1250} /></p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-16 left-12 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-950 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">API Calls</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100"><Counter to={2500000} suffix="M" /></p>
                </motion.div>
              </div>

              {/* Interactive hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-center mt-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                >
                  <MousePointer className="w-3 h-3 text-white/80" />
                  <span className="text-xs text-white/80">Interactive • Drag to explore</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════════ */}
      <section className="py-16 border-y border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/60 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        <Reveal className="max-w-6xl mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: 17, suffix: '+', label: 'Developer Tools',  icon: Package, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
              { value: 1000, suffix: '+', label: 'Active Users',   icon: Users, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
              { value: 40, suffix: '%',  label: 'Faster Shipping', icon: TrendingUp, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
              { value: 99, suffix: '%',  label: 'Uptime SLA',      icon: Activity, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
            ].map(({ value, suffix, label, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={cn(
                  "relative group p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
                  "shadow-sm dark:shadow-slate-950 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-950/50 transition-all duration-300"
                )}
              >
                {/* Gradient background on hover */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  bg,
                  "dark:opacity-0 dark:group-hover:opacity-10"
                )} />

                <div className="relative flex flex-col items-center gap-3">
                  <motion.div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                      `bg-gradient-to-br ${color}`
                    )}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <div>
                    <motion.p
                      className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1"
                      initial={{ scale: 0.5 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5, type: "spring" }}
                    >
                      <Counter to={value} suffix={suffix} />
                    </motion.p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{label}</p>
                  </div>

                  {/* Animated particles */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-2 h-2 bg-orange-400 rounded-full"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  />
                  <motion.div
                    className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 + 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══ PRODUCT MANAGEMENT DEEP DIVE ═════════════════════════ */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 text-[12px] font-bold mb-5">
              <Target className="w-3.5 h-3.5" /> Core Product
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
              Product management<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">the developer way</span>
            </h2>
            <p className="text-[16px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Built by developers who got tired of bloated PM tools. Everything you need, nothing you don't.
            </p>
          </Reveal>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <motion.div
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    rotateX: 5,
                    rotateY: 5
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  onClick={() => setActiveFeature(i)}
                  className={cn(
                    "relative group p-6 rounded-3xl border cursor-pointer transition-all duration-500 overflow-hidden",
                    "hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50",
                    activeFeature === i
                      ? 'border-slate-300 dark:border-slate-600 bg-slate-900 shadow-2xl shadow-slate-900/20'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-200/60 dark:hover:border-slate-700'
                  )}
                  style={{ perspective: '1000px' }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      activeFeature === i ? 'bg-slate-900' : f.bg
                    )}
                    animate={{
                      background: activeFeature === i
                        ? 'linear-gradient(135deg, #0f172a, #1e293b, #334155)'
                        : `linear-gradient(135deg, ${f.bg.replace('bg-', '')}, rgba(255,255,255,0.1))`
                    }}
                  />

                  {/* Floating particles */}
                  {Array.from({ length: 3 }).map((_, pi) => {
                    // Deterministic pseudo-random values based on pi to avoid hydration mismatch
                    const seedX = (pi * 137.5) % 200;
                    const seedY = (pi * 89.3) % 150;
                    return (
                      <motion.div
                        key={pi}
                        className="absolute w-1 h-1 bg-white/60 rounded-full"
                        initial={{
                          x: seedX,
                          y: seedY,
                          opacity: 0
                        }}
                        whileHover={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: (seedX + 50) % 200,
                          y: (seedY + 30) % 150,
                        }}
                        transition={{
                          duration: 2,
                          delay: pi * 0.2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      />
                    );
                  })}

                  <div className="relative flex items-start justify-between mb-4">
                    <motion.div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                        activeFeature === i ? 'bg-white/20' : f.bg
                      )}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <f.icon className={cn(
                        "w-6 h-6",
                        activeFeature === i ? 'text-white' : f.color
                      )} />
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); setActiveFeature(i); }}
                      className={cn(
                        "p-2 rounded-xl transition-colors",
                        activeFeature === i ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                      )}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="relative">
                    <motion.h3
                      className={cn(
                        "text-lg font-bold mb-3 transition-colors",
                        activeFeature === i ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                      )}
                      whileHover={{ scale: 1.02 }}
                    >
                      {f.title}
                    </motion.h3>

                    <motion.p
                      className={cn(
                        "text-sm leading-relaxed transition-colors",
                        activeFeature === i ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      )}
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {f.desc}
                    </motion.p>

                    {/* Progress indicator */}
                    <motion.div
                      className="mt-4 flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                    >
                      <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: '70%' }}
                          transition={{ delay: i * 0.1 + 0.7, duration: 1 }}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-semibold",
                        activeFeature === i ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      )}>
                        70%
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* CTA band */}
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px,white 1px,transparent 0)', backgroundSize: '24px 24px' }}
              />
              <div className="absolute -top-12 right-12 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
              <div className="relative">
                <p className="text-orange-400 text-[12px] font-bold uppercase tracking-widest mb-2">Start free · No credit card</p>
                <h3 className="text-3xl font-black text-white mb-2">Ready to ship faster?</h3>
                <p className="text-slate-400 text-[15px]">Set up your first project in under 2 minutes.</p>
              </div>
              <div className="relative flex gap-3 shrink-0">
                <button onClick={() => router.push('/product-management')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-[14px] hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-2"
                >
                  <Target className="w-4 h-4" /> Open Product Manager
                </button>
                <button onClick={() => router.push('/register')}
                  className="px-6 py-3.5 rounded-2xl border border-white/20 text-white font-bold text-[14px] hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TOOLS GRID ════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-slate-50/60 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Developer Toolkit</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Every tool you need</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[14px] mt-2">17+ tools, all in one place. No more tab soup.</p>
            </div>
            <button onClick={() => router.push('/tools')}
              className="hidden md:flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Browse all <ChevronRight className="w-4 h-4" />
            </button>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tools.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.04}>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}
                  onClick={() => router.push(t.href)}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:shadow-xl hover:shadow-slate-100/70 dark:hover:shadow-slate-950/50 hover:border-slate-200 dark:hover:border-slate-600 transition-all cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-2xl ${t.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <t.icon className={`w-5 h-5 ${t.ic}`} />
                  </div>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-0.5">{t.name}</p>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">{t.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors">
                    <span className="text-[11px] font-semibold">Open</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[12px] font-bold mb-4">
              <MessageSquare className="w-3.5 h-3.5" /> Developer Love
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
              What the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">community</span> says
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join thousands of developers who have transformed their workflow with OpenKai
            </p>
          </Reveal>

          {/* Interactive Testimonial Carousel */}
          <div className="relative">
            <motion.div
              className="overflow-hidden rounded-3xl"
              drag="x"
              dragConstraints={{ left: -200, right: 200 }}
              whileDrag={{ scale: 1.02 }}
            >
              <motion.div
                className="flex gap-6"
                animate={{ x: `-${activeTestimonial * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {testimonials.map((t, i) => (
                  <motion.div
                    key={t.name}
                    className="min-w-full p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl dark:shadow-slate-950"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar with animated ring */}
                      <motion.div
                        className="relative mb-6"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {t.avatar}
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-orange-400"
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>

                      {/* Stars */}
                      <motion.div
                        className="flex gap-1 mb-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                      >
                        {Array.from({ length: 5 }).map((_, si) => (
                          <motion.div
                            key={si}
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{
                              duration: 2,
                              delay: si * 0.1 + i * 0.5,
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                          >
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Quote */}
                      <motion.blockquote
                        className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 max-w-md italic"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.4 }}
                      >
                        "{t.text}"
                      </motion.blockquote>

                      {/* Author */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.6 }}
                      >
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{t.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.role}</p>
                      </motion.div>

                      {/* Floating elements */}
                      <motion.div
                        className="absolute top-4 right-4 w-3 h-3 bg-orange-400 rounded-full"
                        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i }}
                      />
                      <motion.div
                        className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i + 0.5 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    activeTestimonial === i ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
                  )}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            <motion.button
              onClick={() => setActiveTestimonial(Math.max(0, activeTestimonial - 1))}
              disabled={activeTestimonial === 0}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors",
                activeTestimonial === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 rotate-180" />
            </motion.button>

            <motion.button
              onClick={() => setActiveTestimonial(Math.min(testimonials.length - 1, activeTestimonial + 1))}
              disabled={activeTestimonial === testimonials.length - 1}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors",
                activeTestimonial === testimonials.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <Reveal className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
            Build. Ship. Repeat.
          </h2>
          <p className="text-[16px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Join 1,000+ developers using OpenKai to manage products, collaborate with teams, and ship better software.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => router.push('/register')}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[15px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xl shadow-slate-900/20 dark:shadow-slate-950/50"
            >
              <Star className="w-4 h-4 text-amber-300" />
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => router.push('/discover')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[15px] hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-4 h-4" /> Explore Tools
            </button>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-5">No credit card required · Free plan forever · Cancel anytime</p>
        </Reveal>
      </section>
    </div>
  );
}
