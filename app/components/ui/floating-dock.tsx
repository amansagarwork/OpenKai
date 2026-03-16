"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

interface FloatingDockProps {
  items: DockItem[];
  className?: string;
  mobileClassName?: string;
}

export function FloatingDock({ items, className, mobileClassName }: FloatingDockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  return (
    <div
      ref={dockRef}
      className={cn(
        "relative mx-auto h-16 w-fit p-2 rounded-full bg-white/10 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-lg dark:shadow-slate-950/50",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {/* Navigation items */}
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <a
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-white dark:bg-slate-700 shadow-lg"
                    : hoveredIndex === index
                    ? "bg-white dark:bg-slate-700 shadow-lg"
                    : "bg-transparent"
                )}
              >
                <div className={cn(
                  "w-5 h-5 flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "text-slate-900 dark:text-slate-100"
                    : hoveredIndex === index
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-white dark:text-slate-300"
                )}>
                  {item.icon}
                </div>
              </a>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white dark:bg-slate-300 rounded-full" />
              )}
              
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs px-2 py-1 rounded-md whitespace-nowrap"
                  >
                    {item.title}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
