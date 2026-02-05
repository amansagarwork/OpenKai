import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { clearToken, getEmailFromToken, getToken } from '../lib/auth';

interface NavbarProps {
  onNavigate: (path: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [token, setTokenState] = useState(getToken());
  const email = token ? getEmailFromToken(token) : '';

  const initials = (email || 'U')
    .split('@')[0]
    .split(/[._-]/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (servicesRef.current && !servicesRef.current.contains(target)) setServicesOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };

    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    const sync = () => setTokenState(getToken());
    window.addEventListener('storage', sync);
    window.addEventListener('auth-change', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('auth-change', sync as EventListener);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
              <Filter className="w-5 h-5" />
            </span>
            <span className="text-lg font-semibold">A Tools</span>
          </button>

          <div ref={servicesRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setServicesOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-2 font-medium"
            >
              Services
              <ChevronDown className="w-4 h-4" />
            </button>

            {servicesOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setServicesOpen(false);
                    onNavigate('/open-kai');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="font-semibold text-slate-900">OpenPaste</div>
                  <div className="text-xs text-slate-600">Share text snippets</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServicesOpen(false);
                    onNavigate('/minusurl');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-100"
                >
                  <div className="font-semibold text-slate-900">MinusURL</div>
                  <div className="text-xs text-slate-600">Shorten URLs</div>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {token ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setServicesOpen(false);
                }}
                className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm hover:bg-slate-800 transition-colors"
                aria-label="Profile menu"
              >
                {initials || 'U'}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-xs text-slate-500">Signed in as</div>
                    <div className="text-sm font-semibold text-slate-900 truncate">{email || 'Logged in'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('/open-kai/history');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-slate-800 font-medium"
                  >
                    History
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      clearToken();
                      onNavigate('/');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-slate-800 font-medium flex items-center gap-2"
                  >
                    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon icon-tabler icon-tabler-logout"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M9 12h12l-3 -3" />
    <path d="M18 15l3 -3" />
  </svg>

  <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors font-medium"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
