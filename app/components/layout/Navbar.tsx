'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Component, Menu, X, FileText, Link2, Terminal, Code, Target, Sparkles, Shuffle, FileJson, Unlock, Hash, Shield, TrendingUp, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clearToken, getEmailFromToken, getToken, getUsernameFromToken } from "../../lib/auth";
import { slideInLeft, backdropFade, buttonTap } from "../../lib/animations";

export default function Navbar() {
  const router = useRouter();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const servicesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [token, setToken] = useState(getToken());
  const email = token ? getEmailFromToken(token) : "";
  const username = token ? getUsernameFromToken(token) : "";

  const initials = (username || email || "U")
    .split(/[@._-]/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const syncToken = () => setToken(getToken());

    window.addEventListener("storage", syncToken);
    window.addEventListener("auth-change", syncToken as EventListener);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("auth-change", syncToken as EventListener);
    };
  }, []);

  return (
    <>
      <div className="sticky top-2 z-50 mx-auto max-w-[900px] px-4 w-full">
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-md rounded-xl px-5 sm:px-6 lg:px-8 py-4">
          
          {/* ✅ FIXED STRUCTURE HERE */}
          <div className="flex items-center justify-between">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">

              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-3 text-slate-900 hover:text-slate-700 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
                  <Component className="w-5 h-5" />
                </span>
                <span className="text-lg font-semibold">OpenKai</span>
              </Link>

              {/* Desktop: Services Dropdown */}
              <div className="hidden md:block">
                <div ref={servicesRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setServicesOpen((v) => !v);
                      setProfileOpen(false);
                    }}
                    className="group px-4 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    Services
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        servicesOpen ? "rotate-180" : "group-hover:rotate-0"
                      } group-hover:text-slate-600`}
                    />
                  </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute left-0 mt-3 w-[480px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Core Services */}
                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/open-kai");
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 text-left group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                OpenPaste
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-slate-400" />
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">Share text & files</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/minusurl");
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 text-left group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Link2 className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                MinusURL
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-slate-400" />
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">Shorten URLs</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/terminal");
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 text-left group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Terminal className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                Terminal
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-slate-400" />
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">Command execution</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/codehealth");
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 text-left group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Code className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                Code Health
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-slate-400" />
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">Quality analyzer</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/product-management");
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 text-left group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Target className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                Product
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-slate-400" />
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">Project tracking</div>
                            </div>
                          </button>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200 my-3" />

                        {/* Utility Tools */}
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">Utilities</div>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/uuid-generator");
                            }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                              <Sparkles className="w-4 h-4 text-pink-600" />
                            </div>
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              UUID
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/base64-tool");
                            }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                              <Shuffle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              Base64
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/json-formatter");
                            }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                              <FileJson className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              JSON
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/jwt-decoder");
                            }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                              <Unlock className="w-4 h-4 text-cyan-600" />
                            </div>
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              JWT
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/hash-generator");
                            }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                              <Hash className="w-4 h-4 text-lime-600" />
                            </div>
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              Hash
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              router.push("/password-generator");
                            }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                              <Shield className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              Password
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>
              
              {/* Discover Button */}
              <button
                onClick={() => router.push('/discover')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition shadow-sm"
              >
                <TrendingUp className="w-4 h-4" />
                Discover
              </button>
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-4">
              {token ? (
                <button
                  onClick={() => router.push("/profile")}
                  className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm"
                >
                  {initials || "U"}
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="px-6 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium shadow-sm"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE BUTTON */}
            <motion.button
              type="button"
              whileTap={buttonTap}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-11 w-11 flex items-center justify-center rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>

          </div>
        </div>
      </div>
    </>
  );
}
