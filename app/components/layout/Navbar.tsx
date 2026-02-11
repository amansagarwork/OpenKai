'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Component, Menu, X } from "lucide-react";
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

  // Close dropdowns when clicking outside
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

  // Sync token state across tabs
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
      {/* ─── Main Navbar ──────────────────────────────────────── */}
      <div className="sticky top-2 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md rounded-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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

            {/* Desktop: Services + Auth */}
            <div className="hidden md:flex items-center gap-5">
              {/* Services Dropdown */}
              <div ref={servicesRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setServicesOpen((v) => !v);
                    setProfileOpen(false);
                  }}
                  className="group px-5 py-2.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow active:scale-[0.98]"
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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setServicesOpen(false);
                          router.push("/open-kai");
                        }}
                        className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                      >
                        <div className="font-semibold text-slate-900">OpenPaste</div>
                        <div className="text-sm text-slate-600">Share text snippets</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setServicesOpen(false);
                          router.push("/minusurl");
                        }}
                        className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors border-t border-slate-100 flex flex-col gap-0.5"
                      >
                        <div className="font-semibold text-slate-900">MinusURL</div>
                        <div className="text-sm text-slate-600">Shorten URLs</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setServicesOpen(false);
                          router.push("/terminal");
                        }}
                        className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors border-t border-slate-100 flex flex-col gap-0.5"
                      >
                        <div className="font-semibold text-slate-900">Terminal</div>
                        <div className="text-sm text-slate-600">Safe command execution</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setServicesOpen(false);
                          router.push("/code-health");
                        }}
                        className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors border-t border-slate-100 flex flex-col gap-0.5"
                      >
                        <div className="font-semibold text-slate-900">Code Health</div>
                        <div className="text-sm text-slate-600">Code quality analyzer</div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth / Profile */}
              {token ? (
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen((v) => !v);
                      setServicesOpen(false);
                    }}
                    className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm hover:shadow active:scale-95"
                    aria-label="Profile menu"
                  >
                    {initials || "U"}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                      >
                        {/* Profile header – clickable */}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            router.push("/profile");
                          }}
                          className="w-full px-6 py-5 hover:bg-slate-50 transition-colors flex items-center gap-4 group"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-lg shrink-0">
                            {initials || "U"}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-semibold text-slate-900 truncate">
                              {username || "User"}
                            </div>
                            <div className="text-sm text-slate-500 truncate mt-0.5">
                              {email}
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div className="border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              router.push("/open-kai/history");
                            }}
                            className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors text-slate-800 font-medium"
                          >
                            History
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              clearToken();
                              router.push("/");
                            }}
                            className="w-full text-left px-6 py-4 hover:bg-red-50 transition-colors text-red-700 font-medium flex items-center justify-between"
                          >
                            <span>Logout</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={20}
                              height={20}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                              <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                              <path d="M9 12h12l-3 -3" />
                              <path d="M18 15l3 -3" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="px-6 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors font-medium shadow-sm hover:shadow"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <motion.button
              type="button"
              whileTap={buttonTap}
              onClick={() => {
                setMobileOpen(!mobileOpen);
                setServicesOpen(false);
                setProfileOpen(false);
              }}
              className="md:hidden h-11 w-11 flex items-center justify-center rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[100]"
            variants={backdropFade}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-2xl"
              variants={slideInLeft}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
                  <span className="font-semibold text-xl">Menu</span>
                  <motion.button
                    whileTap={buttonTap}
                    onClick={() => setMobileOpen(false)}
                    className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-7 h-7" />
                  </motion.button>
                </div>

                {/* Services */}
                <div className="px-6 py-8 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-500 mb-5 uppercase tracking-wide">
                    Services
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/open-kai");
                    }}
                    className="w-full flex items-center justify-between py-4 px-5 rounded-xl hover:bg-slate-50 transition-colors mb-2 text-left"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">OpenPaste</div>
                      <div className="text-sm text-slate-600 mt-1">Share text snippets</div>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/minusurl");
                    }}
                    className="w-full flex items-center justify-between py-4 px-5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">MinusURL</div>
                      <div className="text-sm text-slate-600 mt-1">Shorten URLs</div>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/terminal");
                    }}
                    className="w-full flex items-center justify-between py-4 px-5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Terminal</div>
                      <div className="text-sm text-slate-600 mt-1">Safe command execution</div>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/code-health");
                    }}
                    className="w-full flex items-center justify-between py-4 px-5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Code Health</div>
                      <div className="text-sm text-slate-600 mt-1">Code quality analyzer</div>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Auth / Profile Section */}
                {token ? (
                  <div className="px-6 py-8 border-t border-slate-100 mt-auto">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        router.push("/profile");
                      }}
                      className="w-full flex items-center gap-4 py-4 px-5 -mx-5 rounded-xl hover:bg-slate-50 transition-colors group mb-6"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-lg shrink-0">
                        {initials || "U"}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-semibold text-slate-900 truncate">{username || "User"}</div>
                        <div className="text-sm text-slate-500 truncate mt-0.5">{email}</div>
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          router.push("/open-kai/history");
                        }}
                        className="w-full flex items-center justify-between py-4 px-5 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                      >
                        <span>History</span>
                        <svg
                          className="w-5 h-5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          clearToken();
                          setMobileOpen(false);
                          router.push("/");
                        }}
                        className="w-full flex items-center justify-between py-4 px-5 rounded-xl hover:bg-red-50 text-red-700 transition-colors font-medium"
                      >
                        <span>Logout</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                          <path d="M9 12h12l-3 -3" />
                          <path d="M18 15l3 -3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-8 mt-auto border-t border-slate-100">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        router.push("/register");
                      }}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors mb-4 shadow-sm"
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        router.push("/login");
                      }}
                      className="w-full py-4 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}