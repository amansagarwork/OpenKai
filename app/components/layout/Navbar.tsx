'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown, Component, Menu, X, FileText, Link2, Terminal, Code, Target,
  Sparkles, Shuffle, FileJson, Unlock, Hash, Shield, TrendingUp, ArrowUpRight,
  Settings, Heart, LogOut, User, Bell, LifeBuoy, Rocket, Compass, Star,
  Zap, Archive, BookMarked, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clearToken, getEmailFromToken, getToken, getUsernameFromToken } from "../../lib/auth";
import { ThemeToggle } from "../ui/ThemeToggle";

/* ─── static data ───────────────────────────────────────────── */
const services = [
  { label: "OpenPaste",   desc: "Share text & files",  href: "/open-kai",           icon: FileText, bg: "bg-blue-50",    ic: "text-blue-600"    },
  { label: "MinusURL",    desc: "Shorten URLs",         href: "/minusurl",           icon: Link2,    bg: "bg-violet-50",  ic: "text-violet-600"  },
  { label: "Terminal",    desc: "Command execution",    href: "/terminal",           icon: Terminal, bg: "bg-slate-900",  ic: "text-white"       },
  { label: "Code Health", desc: "Quality analyzer",     href: "/codehealth",         icon: Code,     bg: "bg-indigo-50",  ic: "text-indigo-600"  },
  { label: "Product",     desc: "Project tracking",     href: "/product-management", icon: Target,   bg: "bg-emerald-50", ic: "text-emerald-600" },
];

const utilities = [
  { label: "UUID",     href: "/uuid-generator",     icon: Sparkles, bg: "bg-pink-50",    ic: "text-pink-600"    },
  { label: "Base64",   href: "/base64-tool",        icon: Shuffle,  bg: "bg-amber-50",   ic: "text-amber-600"   },
  { label: "JSON",     href: "/json-formatter",     icon: FileJson, bg: "bg-emerald-50", ic: "text-emerald-600" },
  { label: "JWT",      href: "/jwt-decoder",        icon: Unlock,   bg: "bg-cyan-50",    ic: "text-cyan-600"    },
  { label: "Hash",     href: "/hash-generator",     icon: Hash,     bg: "bg-lime-50",    ic: "text-lime-600"    },
  { label: "Password", href: "/password-generator", icon: Shield,   bg: "bg-rose-50",    ic: "text-rose-600"    },
];

const launches = [
  {
    icon: Rocket,
    bg: "bg-orange-50",
    ic: "text-orange-500",
    label: "New Launches",
    sub: "Today's fresh tools & products",
    href: "/launches",
    badge: "Live",
    badgeColor: "bg-orange-100 text-orange-600",
  },
  {
    icon: Archive,
    bg: "bg-rose-50",
    ic: "text-rose-500",
    label: "Launch Archive",
    sub: "Most-loved launches by the community",
    href: "/launches/archive",
    badge: null,
    badgeColor: "",
  },
  {
    icon: BookMarked,
    bg: "bg-sky-50",
    ic: "text-sky-500",
    label: "Launch Guide",
    sub: "Checklists and pro tips for launching",
    href: "/launches/guide",
    badge: null,
    badgeColor: "",
  },
];

const profileLinks = [
  { icon: User,     label: "My Profile",       sub: "View your public profile", href: "/profile"                },
  { icon: Settings, label: "Account Settings", sub: "Preferences & security",   href: "/profile"                },
  { icon: Heart,    label: "My Favourites",    sub: "Saved tools & pastes",     href: "/profile?favorites=true" },
  { icon: Bell,     label: "Notifications",    sub: "Updates & alerts",         href: "/notifications"          },
  { icon: LifeBuoy, label: "Help & Support",   sub: "Get assistance",           href: "/support"                },
];

/* ─── framer preset ─────────────────────────────────────────── */
const dropIn = {
  initial:    { opacity: 0, y: 8, scale: 0.97 },
  animate:    { opacity: 1, y: 0, scale: 1    },
  exit:       { opacity: 0, y: 8, scale: 0.97 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

/* ─── reusable hover-zone hook ──────────────────────────────── */
function useHoverMenu(delay = 120) {
  const [open, setOpen]  = useState(false);
  const timer            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => { if (timer.current) clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = setTimeout(() => setOpen(false), delay); };
  return { open, setOpen, enter, leave };
}

/* ══════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const router = useRouter();

  const svc     = useHoverMenu();
  const lnch    = useHoverMenu();
  const profile = useHoverMenu();

  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [mobileSvcOpen, setMobileSvcOpen] = useState(false);
  const [mobileLnchOpen,setMobileLnchOpen]= useState(false);
  const [scrolled,      setScrolled]      = useState(false);

  const [token,   setToken]   = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setToken(getToken()); }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const email    = token ? getEmailFromToken(token)    : "";
  const username = token ? getUsernameFromToken(token) : "";
  const initials = (username || email || "U")
    .split(/[@._-]/g).filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase()).join("").slice(0, 2);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => setToken(getToken());
    window.addEventListener("storage",     sync);
    window.addEventListener("auth-change", sync as EventListener);
    return () => {
      window.removeEventListener("storage",     sync);
      window.removeEventListener("auth-change", sync as EventListener);
    };
  }, [mounted]);

  /* close all dropdowns on route change */
  const go = (href: string) => {
    svc.setOpen(false); lnch.setOpen(false); profile.setOpen(false);
    setMobileOpen(false);
    router.push(href);
  };

  const navBtn = "flex items-center gap-1.5 px-3.5 py-1.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-150 select-none";

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "pt-2" : "pt-3"}`}>
      <div className="max-w-[1000px] mx-auto px-3 sm:px-4">

        {/* ══ NAVBAR PILL ══════════════════════════════════════════ */}
        <div className={`
          flex items-center justify-between gap-4
          rounded-2xl border px-4 sm:px-5 py-2.5
          transition-all duration-300
          ${scrolled
            ? "bg-white/96 dark:bg-slate-900/96 border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 backdrop-blur-2xl"
            : "bg-white/85 dark:bg-slate-900/85 border-slate-200/60 dark:border-slate-700/60 shadow-md shadow-slate-100/40 dark:shadow-slate-950/40 backdrop-blur-xl"
          }
        `}>

          {/* ── LEFT: Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <Component className="w-4 h-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900 hidden sm:block">OpenKai</span>
          </Link>

          {/* ── CENTER: Nav links (lg+) ── */}
          <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">

            {/* ── SERVICES (hover) ── */}
            <div
              className="relative"
              onMouseEnter={() => { lnch.setOpen(false); svc.enter(); }}
              onMouseLeave={svc.leave}
            >
              <button type="button" className={navBtn}>
                Services
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${svc.open ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {svc.open && (
                  <motion.div {...dropIn}
                    onMouseEnter={svc.enter} onMouseLeave={svc.leave}
                    className="absolute left-1/2 -translate-x-1/2 mt-3 w-[450px] rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
                    <div className="p-3.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2.5">Core Services</p>
                      <div className="grid grid-cols-2 gap-1.5 mb-3.5">
                        {services.map(({ label, desc, href, icon: Icon, bg, ic }) => (
                          <button key={href} type="button" onClick={() => go(href)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-150 text-left group"
                          >
                            <div className={`w-9 h-9 shrink-0 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-150`}>
                              <Icon className={`w-[18px] h-[18px] ${ic}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-[13px] flex items-center gap-1">
                                {label}
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 text-slate-400" />
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="h-px bg-slate-100 mb-3" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">Utilities</p>
                      <div className="grid grid-cols-6 gap-1">
                        {utilities.map(({ label, href, icon: Icon, bg, ic }) => (
                          <button key={href} type="button" onClick={() => go(href)}
                            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-all duration-150 group"
                          >
                            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform duration-150`}>
                              <Icon className={`w-4 h-4 ${ic}`} />
                            </div>
                            <span className="text-[11px] font-medium text-slate-600">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── LAUNCHES (hover) ── */}
            <div
              className="relative"
              onMouseEnter={() => { svc.setOpen(false); lnch.enter(); }}
              onMouseLeave={lnch.leave}
            >
              <button type="button" className={navBtn}>
                Launches
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${lnch.open ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {lnch.open && (
                  <motion.div {...dropIn}
                    onMouseEnter={lnch.enter} onMouseLeave={lnch.leave}
                    className="absolute left-1/2 -translate-x-1/2 mt-3 w-[320px] rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent" />

                    {/* Featured new launches strip */}
                    <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-orange-50 to-rose-50 border-b border-orange-100/60">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold tracking-wide">
                          <Zap className="w-2.5 h-2.5" /> LIVE
                        </span>
                        <span className="text-[11px] text-orange-600 font-semibold">Today's launches</span>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        Fresh products & tools launched by the community — updated daily.
                      </p>
                      <button
                        onClick={() => go("/launches")}
                        className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        View today's launches <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Links */}
                    <div className="p-2">
                      {launches.map(({ icon: Icon, bg, ic, label, sub, href, badge, badgeColor }) => (
                        <button key={href} type="button" onClick={() => go(href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-150 text-left group"
                        >
                          <div className={`w-9 h-9 shrink-0 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-150`}>
                            <Icon className={`w-[18px] h-[18px] ${ic}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
                              {label}
                              {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{sub}</p>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing */}
            {/* <Link href="/pricing" className={navBtn}>Pricing</Link> */}

            {/* Tools */}
            <Link href="/developer-tools" className={navBtn}>Tools</Link>

            {/* Discover pill */}
            <button
              onClick={() => go('/discover')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 ml-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold text-[13px] hover:from-orange-600 hover:to-red-600 active:scale-[0.97] transition-all duration-150 shadow-sm shadow-orange-200/60"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Discover
            </button>
          </nav>

          {/* ── RIGHT: Auth ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Tablet links (md → lg) */}
            <div className="hidden md:flex lg:hidden items-center gap-1">
              <Link href="/launches" className={navBtn}><Rocket className="w-3.5 h-3.5" /> Launches</Link>
              <Link href="/pricing"  className={navBtn}>Pricing</Link>
              <button onClick={() => go('/discover')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold text-[12px] shadow-sm"
              >
                <TrendingUp className="w-3.5 h-3.5" />Discover
              </button>
            </div>

            {!mounted ? (
              <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />
            ) : token ? (

              /* ── PROFILE HOVER ZONE ── */
              <div
                className="relative"
                onMouseEnter={profile.enter}
                onMouseLeave={profile.leave}
              >
                <button
                  onClick={() => profile.setOpen(v => !v)}
                  aria-label="Open profile menu"
                  className={`
                    relative h-9 w-9 rounded-full
                    bg-gradient-to-br from-slate-600 to-slate-900
                    text-white flex items-center justify-center
                    font-bold text-[13px] tracking-wide select-none
                    transition-all duration-200
                    hover:shadow-lg hover:shadow-slate-300/60
                    hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-slate-300/60
                    ${profile.open ? "ring-2 ring-white ring-offset-2 ring-offset-slate-300/60 shadow-lg" : ""}
                  `}
                >
                  {initials || "U"}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                </button>

                <AnimatePresence>
                  {profile.open && (
                    <motion.div {...dropIn}
                      onMouseEnter={profile.enter} onMouseLeave={profile.leave}
                      className="absolute right-0 mt-3 w-[272px] rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40 overflow-hidden"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

                      {/* User card */}
                      <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-slate-100">
                        <div className="relative shrink-0">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-white flex items-center justify-center font-bold text-[14px] shadow-sm select-none">
                            {initials || "U"}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[14px] text-slate-900 truncate leading-snug">{username || "User"}</p>
                          <p className="text-[11.5px] text-slate-400 truncate">{email}</p>
                          <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                            Active
                          </span>
                        </div>
                      </div>

                      {/* Menu */}
                      <div className="p-2">
                        {profileLinks.map(({ icon: Icon, label, sub, href }) => (
                          <button key={`${href}-${label}`} onClick={() => { profile.setOpen(false); go(href); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all duration-150 group text-left"
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:scale-105 transition-all duration-150">
                              <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-900 leading-snug">{label}</p>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{sub}</p>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 shrink-0" />
                          </button>
                        ))}

                        <div className="h-px bg-slate-100 my-2 mx-1" />
                        <button
                          onClick={() => { profile.setOpen(false); clearToken(); router.push("/"); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 active:bg-red-100 transition-all duration-150 group text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 group-hover:scale-105 transition-all duration-150">
                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-red-500 leading-snug">Sign Out</p>
                            <p className="text-[11px] text-red-300 mt-0.5">See you next time</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            ) : (
              /* ── NOT LOGGED IN — beautiful CTA ── */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/login")}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-[13px] transition-all duration-150"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="group flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold text-[13px] shadow-sm shadow-slate-900/20 transition-all duration-150"
                >
                  {/* <Star className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform duration-200" /> */}
                  Get Started
                </button>
              </div>
            )}

            {/* Hamburger (< lg) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors ml-1"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:  90, opacity: 0 }} transition={{ duration: 0.15 }}><X    className="w-[18px] h-[18px]" /></motion.span>
                  : <motion.span key="m" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-[18px] h-[18px]" /></motion.span>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ══ MOBILE MENU ══════════════════════════════════════════ */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0   }}
              exit={   { opacity: 0, y: -8  }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-xl shadow-2xl shadow-slate-200/60 overflow-hidden"
            >
              <div className="p-3 space-y-1">

                {/* Services accordion */}
                <button onClick={() => { setMobileSvcOpen(v => !v); setMobileLnchOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-[13.5px] text-slate-800">Services</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileSvcOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {mobileSvcOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="pl-2 pb-1 grid grid-cols-2 gap-1">
                        {services.map(({ label, href, icon: Icon, bg, ic }) => (
                          <button key={href} onClick={() => go(href)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 shrink-0 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${ic}`} /></div>
                            <span className="text-[12.5px] font-medium text-slate-700">{label}</span>
                          </button>
                        ))}
                      </div>
                      <div className="h-px bg-slate-100 mx-3 my-2" />
                      <div className="pl-2 pb-1 grid grid-cols-3 gap-1">
                        {utilities.map(({ label, href, icon: Icon, bg, ic }) => (
                          <button key={href} onClick={() => go(href)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className={`w-7 h-7 shrink-0 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-3.5 h-3.5 ${ic}`} /></div>
                            <span className="text-[12px] font-medium text-slate-600">{label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Launches accordion */}
                <button onClick={() => { setMobileLnchOpen(v => !v); setMobileSvcOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-[13.5px] text-slate-800 flex items-center gap-2">
                    Launches
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold">
                      <Zap className="w-2.5 h-2.5" />Live
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileLnchOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {mobileLnchOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pl-2 space-y-0.5">
                      {launches.map(({ icon: Icon, bg, ic, label, sub, href }) => (
                        <button key={href} onClick={() => go(href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 shrink-0 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${ic}`} /></div>
                          <div>
                            <p className="text-[12.5px] font-semibold text-slate-800">{label}</p>
                            <p className="text-[11px] text-slate-400">{sub}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pricing */}
                <Link href="/pricing" onClick={() => setMobileOpen(false)}
                  className="block px-3.5 py-3 rounded-xl hover:bg-slate-50 text-[13.5px] font-semibold text-slate-800 transition-colors"
                >
                  Pricing
                </Link>

                {/* Discover */}
                <button onClick={() => go('/discover')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-[13.5px] shadow-sm"
                >
                  <TrendingUp className="w-4 h-4" /> Discover
                </button>

                <div className="h-px bg-slate-100 mx-1" />

                {/* Auth section */}
                {!mounted ? (
                  <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ) : token ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50">
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-white flex items-center justify-center font-bold text-[13px]">{initials || "U"}</div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-slate-900">{username || "User"}</p>
                        <p className="text-[11px] text-slate-400">{email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {profileLinks.slice(0, 4).map(({ icon: Icon, label, href }) => (
                        <button key={`mob-${href}-${label}`} onClick={() => go(href)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-[12.5px] font-medium text-slate-700"
                        >
                          <Icon className="w-4 h-4 text-slate-400 shrink-0" />{label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { clearToken(); router.push("/"); setMobileOpen(false); }}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-[13px] font-semibold text-red-500"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  /* ── Mobile not-logged-in ── */
                  <div className="space-y-2 pt-1">
                    {/* Value prop strip */}
                    <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/60">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                        <Compass className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">Join OpenKai</p>
                        <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">Access all tools, launch your products & track your projects.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setMobileOpen(false); router.push("/login"); }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[13px] transition-colors"
                      >Log in</button>
                      <button onClick={() => { setMobileOpen(false); router.push("/register"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-[13px] transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-300" />Get Started
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}