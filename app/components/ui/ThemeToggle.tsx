'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '@/app/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const context = useContext(ThemeContext);
  
  // Gracefully handle being outside ThemeProvider
  if (!context) {
    return (
      <button
        className={`p-2 rounded-xl hover:bg-slate-100 transition-colors ${className}`}
        aria-label="Theme (unavailable)"
        disabled
      >
        <Sun className="w-5 h-5 text-slate-400" />
      </button>
    );
  }
  
  const { theme, resolvedTheme, toggleTheme, setTheme } = context;

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const Icon = icons[resolvedTheme === 'dark' ? 'dark' : 'light'];

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-slate-600 dark:text-slate-300 ${className}`}
      >
        <Icon className="w-4 h-4" />
        <span className="capitalize">{theme === 'system' ? 'Auto' : theme}</span>
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative group ${className}`}>
      <button
        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Theme options"
      >
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-40 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {(['light', 'dark', 'system'] as const).map((t) => {
          const ThemeIcon = icons[t];
          return (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                theme === t ? 'text-orange-500 font-medium' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ThemeIcon className="w-4 h-4" />
              <span className="capitalize">{t === 'system' ? 'System' : t}</span>
              {theme === t && (
                <motion.div
                  layoutId="activeTheme"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
