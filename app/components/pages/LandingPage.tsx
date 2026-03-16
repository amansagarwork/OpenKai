'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Check, Zap, Shield, Users, Code, Kanban, Calendar, BarChart3,
  Terminal, FileJson, Link2, FileText, Hash, Sparkles, ArrowRight,
  Star, GitBranch, Clock, Lock, Globe, Cpu, ChevronRight, Play,
  Target, Layers, Rocket, Heart, MessageSquare, TrendingUp,
  CheckCircle2, X, Sun, Moon
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: Kanban,
    title: 'Kanban Boards',
    desc: 'Drag-and-drop task management with custom columns, swimlanes, and WIP limits.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Calendar,
    title: 'Sprint Planning',
    desc: 'Plan, track, and retrospectives. Sprint burndown charts and velocity tracking.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Code,
    title: 'Dev Tools Suite',
    desc: 'JSON formatter, Base64, JWT decoder, UUID generator, terminal, and more.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Real-time insights, cycle time reports, and team performance metrics.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Shield,
    title: 'Security First',
    desc: 'Enterprise-grade security with SSO, audit logs, and role-based access.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Comments, mentions, file attachments, and real-time notifications.',
    color: 'from-amber-500 to-yellow-500',
  },
];

const tools = [
  { name: 'JSON Formatter', icon: FileJson, desc: 'Format & validate' },
  { name: 'Base64 Tool', icon: Code, desc: 'Encode/decode' },
  { name: 'JWT Decoder', icon: Sparkles, desc: 'Inspect tokens' },
  { name: 'UUID Generator', icon: Hash, desc: 'Unique IDs' },
  { name: 'URL Shortener', icon: Link2, desc: 'MinusURL' },
  { name: 'Pastebin', icon: FileText, desc: 'OpenPaste' },
  { name: 'Terminal', icon: Terminal, desc: 'Web shell' },
  { name: 'Code Health', icon: Cpu, desc: 'Analyze quality' },
];

const pricingPlans = [
  {
    name: 'Free',
    description: 'For individuals and small teams getting started',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Up to 3 team members',
      'Unlimited projects',
      'Basic Kanban boards',
      '5 dev tools',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For growing teams that need more power',
    price: { monthly: 12, yearly: 96 },
    features: [
      'Up to 15 team members',
      'Unlimited projects',
      'Advanced Kanban & Sprint planning',
      'All 15+ dev tools',
      'Analytics dashboard',
      'Priority support',
      'Custom fields',
      'API access',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations with advanced needs',
    price: { monthly: 39, yearly: 312 },
    features: [
      'Unlimited team members',
      'Unlimited everything',
      'SSO & SAML',
      'Audit logs',
      'Advanced security',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Aryan Mehta',
    role: 'Lead Engineer',
    company: 'TechCorp',
    avatar: 'AM',
    text: 'OpenKai replaced 3 different tools for our team. The product manager alone is worth the switch.',
    stars: 5,
  },
  {
    name: 'Shreya Patel',
    role: 'Product Manager',
    company: 'StartupX',
    avatar: 'SP',
    text: 'Finally a PM tool made by developers, for developers. The code integration feature is 🔥.',
    stars: 5,
  },
  {
    name: 'Kiran Rao',
    role: 'Full Stack Dev',
    company: 'DevStudio',
    avatar: 'KR',
    text: 'The all-in-one toolkit saved us so much context-switching. We ship 40% faster now.',
    stars: 5,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">OpenKai</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#tools" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Tools</a>
              <a href="#pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => router.push('/login')}
                className="hidden sm:block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-100/40 dark:from-orange-900/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-50/60 dark:from-blue-900/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 text-sm font-medium mb-8"
            >
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
              Trusted by 1,000+ developer teams worldwide
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6"
            >
              The all-in-one{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                  developer
                </span>
              </span>{' '}
              platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Product management, developer tools, and team collaboration in one seamless platform. 
              Ship faster with less context switching.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={() => router.push('/register')}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/20 dark:shadow-slate-950/50"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/product-management')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Play className="w-5 h-5 text-orange-500" />
                See Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease }}
              className="mt-12 flex items-center justify-center gap-8 text-slate-400 dark:text-slate-600"
            >
              <div className="flex -space-x-3">
                {['AM', 'KR', 'SP', 'JK', 'PR'].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-bold text-slate-900 dark:text-white ml-2">4.9</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">from 200+ reviews</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From project management to developer tools, OpenKai has you covered.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.1}>
                <div className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              15+ Developer Tools Built-in
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Stop switching between apps. All your essential dev tools, right where you work.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <Reveal key={tool.name} delay={i * 0.05}>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all group cursor-pointer">
                  <tool.icon className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-orange-500 transition-colors mb-3" />
                  <h4 className="font-semibold text-slate-900 dark:text-white">{tool.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tool.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Start free, upgrade when you need to.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !isYearly
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isYearly
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                  Save 33%
                </span>
              </button>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pricingPlans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <div
                  className={`relative p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 transition-all ${
                    plan.popular
                      ? 'border-orange-500 dark:border-orange-500 shadow-xl shadow-orange-100 dark:shadow-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        ${isYearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                    {isYearly && plan.price.monthly > 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        ${Math.round(plan.price.yearly / 12)}/month billed annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => router.push('/register')}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by developers
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See what teams are saying about OpenKai.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Reveal key={testimonial.name} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-8 md:p-12 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to ship faster?
                </h2>
                <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                  Join 1,000+ teams who've streamlined their workflow with OpenKai.
                  Start free, no credit card required.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => router.push('/register')}
                    className="px-8 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-colors"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => router.push('/product-management')}
                    className="px-8 py-4 rounded-xl border-2 border-slate-600 text-white font-bold text-lg hover:bg-slate-800 transition-colors"
                  >
                    Explore Demo
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">OpenKai</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The all-in-one developer productivity platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2026 OpenKai. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
