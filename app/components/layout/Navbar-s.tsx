'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home, Terminal, Code, Target,
  Sparkles, FileJson, Shield, Hash, TrendingUp, ArrowUpRight,
  Settings, Heart, LogOut, User, Bell, LifeBuoy, Rocket, Compass, Star,
  Archive, BookMarked, ArrowRight, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingDock } from "../ui/floating-dock";
import { clearToken, getEmailFromToken, getToken, getUsernameFromToken } from "../../lib/auth";

export default function NavbarS() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setToken(getToken()); }, []);

  const email = token ? getEmailFromToken(token) : "";
  const username = token ? getUsernameFromToken(token) : "";
  const initials = (username || email || "U")
    .split(/[@._-]/g).filter(Boolean).slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase()).join("").slice(0, 2);

  const links = [
    {
      title: "Home",
      icon: <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/",
    },
    {
      title: "Products",
      icon: <Target className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/product-management",
    },
    {
      title: "Terminal",
      icon: <Terminal className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/terminal",
    },
    {
      title: "Code Health",
      icon: <Code className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/codehealth",
    },
    {
      title: "Tools",
      icon: <Sparkles className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/developer-tools",
    },
    {
      title: "Discover",
      icon: <TrendingUp className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/discover",
    },
  ];

  if (!mounted) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="h-16 w-fit px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-pulse" />
      </div>
    );
  }

  return (
    <FloatingDock items={links} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl" />
  );
}