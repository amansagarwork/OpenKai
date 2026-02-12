'use client';

import Link from 'next/link';
import { Component, Github, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Tools',
      links: [
        { name: 'OpenPaste', href: '/open-kai' },
        { name: 'MinusURL', href: '/minusurl' },
        { name: 'Terminal', href: '/terminal' },
        { name: 'Code Health', href: '/codehealth' },
      ],
    },
    {
      title: 'Utilities',
      links: [
        { name: 'UUID Generator', href: '/uuid-generator' },
        { name: 'JSON Formatter', href: '/json-formatter' },
        { name: 'Base64 Tool', href: '/base64-tool' },
        { name: 'Discover All', href: '/discover' },
      ],
    },
    {
      title: 'Account',
      links: [
        { name: 'Login', href: '/login' },
        { name: 'Register', href: '/register' },
        { name: 'Profile', href: '/profile' },
        { name: 'History', href: '/open-kai/history' },
      ],
    },
  ];

  return (
    <footer className="relative bg-slate-50 text-slate-600 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-slate-900 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white">
                <Component className="w-4 h-4" />
              </span>
              <span className="font-bold text-lg">OpenKai</span>
            </Link>
            <p className="text-sm text-slate-500 mb-4">
              A collection of powerful developer tools to boost your productivity.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-slate-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Large Background Typography */}
        <div className="relative h-32 md:h-48 mb-8 overflow-hidden">
          <span 
            className="absolute inset-0 flex items-center justify-center text-[15vw] md:text-[12vw] font-black tracking-tighter text-slate-200/60 uppercase select-none"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            OpenKai
          </span>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} OpenKai. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for developers
          </p>
        </div>
      </div>
    </footer>
  );
}
