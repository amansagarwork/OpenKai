'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Component, Menu, X, User, LogOut, Settings } from "lucide-react";
import { clearToken, getEmailFromToken, getToken, getUsernameFromToken } from "../../lib/auth";

export default function SimpleNavbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [token, setToken] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    setToken(getToken()); 
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const email = token ? getEmailFromToken(token) : "";
  const username = token ? getUsernameFromToken(token) : "";
  const initials = (username || email || "U")
    .split(/[@._-]/g).filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase()).join("").slice(0, 2);

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  // Don't show on homepage
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "pt-2" : "pt-3"}`}>
      <div className="max-w-[1000px] mx-auto px-3 sm:px-4">
        <div className={`
          flex items-center justify-between gap-4
          rounded-2xl border px-4 sm:px-5 py-2.5
          transition-all duration-300
          ${scrolled
            ? "bg-white/96 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-2xl"
            : "bg-white/85 border-slate-200/60 shadow-md shadow-slate-100/40 backdrop-blur-xl"
          }
        `}>
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <Component className="w-4 h-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900 hidden sm:block">OpenKai</span>
          </Link>

          {/* RIGHT: Auth options */}
          <div className="flex items-center gap-2 shrink-0">
            {!mounted ? (
              <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />
            ) : token ? (
              <div className="flex items-center gap-2">
                {/* Profile dropdown for logged in users */}
                <div className="relative group">
                  <button
                    className="relative h-9 w-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-white flex items-center justify-center font-bold text-[13px] tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-slate-300/60"
                  >
                    {initials || "U"}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <button
                        onClick={() => router.push("/profile")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Profile</span>
                      </button>
                      <button
                        onClick={() => router.push("/profile?settings=true")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Settings</span>
                      </button>
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Not logged in - Login/Register buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/login")}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-[13px] transition-all duration-150"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold text-[13px] shadow-sm shadow-slate-900/20 transition-all duration-150"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors ml-1"
            >
              {mobileOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-xl shadow-2xl shadow-slate-200/60 overflow-hidden">
            <div className="p-3 space-y-2">
              {!mounted ? (
                <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ) : token ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50">
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-white flex items-center justify-center font-bold text-[13px]">{initials || "U"}</div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-slate-900">{username || "User"}</p>
                      <p className="text-[11px] text-slate-400">{email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { router.push("/profile"); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Profile</span>
                  </button>
                  <button
                    onClick={() => { router.push("/profile?settings=true"); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Settings</span>
                  </button>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => { router.push("/login"); setMobileOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[13px] transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => { router.push("/register"); setMobileOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-[13px] transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
