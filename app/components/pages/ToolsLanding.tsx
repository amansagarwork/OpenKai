'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, Link2, Terminal, Code, Sparkles, Shuffle, FileJson, Shield, Unlock, Globe, Hash, Bug, Code2, Palette, FileSpreadsheet, Type, Target, ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Animation variants for scroll reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export default function ToolsLanding() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <ScrollReveal className="mb-8">
          <ScrollItem>
            <h1 className="text-4xl font-bold text-slate-900">Internal Tools</h1>
          </ScrollItem>
          <ScrollItem>
            <p className="mt-2 text-slate-600">
              A simple toolbox for your team. Choose a service to get started.
            </p>
          </ScrollItem>
        </ScrollReveal>

        {/* FEATURED🔥 Section */}
        <ScrollReveal className="mb-10">
          <ScrollItem>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              FEATURED<span className="text-orange-500">🔥</span>
            </h2>
          </ScrollItem>
          <ScrollItem>
            <p className="mt-1 text-sm text-slate-600">
              Most popular and frequently used tools
            </p>
          </ScrollItem>
        </ScrollReveal>

        <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-stretch">
          <ScrollItem className="h-full">
            <button
              type="button"
              onClick={() => router.push('/open-kai')}
              className="h-full w-full text-left bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all relative overflow-hidden group flex flex-col"
            >
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                HOT
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-105 transition-transform">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold text-slate-900">
                    OpenPaste
                  </div>
                  <div className="text-sm text-slate-600">Share text snippets instantly</div>
                </div>
              </div>

              <div className="mt-5 text-sm text-slate-600 flex-1">
                Create a paste, get a short URL, and share it with your team.
              </div>
            </button>
          </ScrollItem>

          <ScrollItem className="h-full">
            <button
              type="button"
              onClick={() => router.push('/minusurl')}
              className="h-full w-full text-left bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl shadow-sm border border-violet-200 p-6 hover:shadow-lg hover:border-violet-300 transition-all relative overflow-hidden group flex flex-col"
            >
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                HOT
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-100 rounded-xl group-hover:scale-105 transition-transform">
                  <Link2 className="w-7 h-7 text-violet-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold text-slate-900">
                    MinusURL
                  </div>
                  <div className="text-sm text-slate-600">Shorten long URLs</div>
                </div>
              </div>

              <div className="mt-5 text-sm text-slate-600 flex-1">
                Convert long URLs into short, shareable links.
              </div>
            </button>
          </ScrollItem>

          <ScrollItem className="h-full">
            <button
              type="button"
              onClick={() => router.push('/product-management')}
              className="h-full w-full text-left bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all relative overflow-hidden group flex flex-col"
            >
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                HOT
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl group-hover:scale-105 transition-transform">
                  <Target className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold text-slate-900">
                    Product Management
                  </div>
                  <div className="text-sm text-slate-600">Project tracking tool</div>
                </div>
              </div>

              <div className="mt-5 text-sm text-slate-600 flex-1">
                Manage sprints, track issues, and integrate with GitHub and Slack.
              </div>
            </button>
          </ScrollItem>
        </ScrollReveal>

        {/* All Tools Section */}
        <ScrollReveal className="mb-8">
          <ScrollItem>
            <h2 className="text-2xl font-bold text-slate-900">All Tools</h2>
          </ScrollItem>
          <ScrollItem>
            <p className="mt-1 text-sm text-slate-600">
              Complete collection of available tools
            </p>
          </ScrollItem>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => router.push('/open-kai')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">OpenPaste</div>
                <div className="text-sm text-slate-600">Share text snippets instantly</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Create a paste, get a short URL, and share it with your team.
            </div>
          </button>

           <button
            type="button"
            onClick={() => router.push('/product-management')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="w-7 h-7 text-pink-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Product Management</div>
                <div className="text-sm text-slate-600">Jira-style project tracker</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Manage sprints, track issues, and integrate with GitHub and Slack.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/minusurl')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Link2 className="w-7 h-7 text-violet-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">MinusURL</div>
                <div className="text-sm text-slate-600">Shorten long URLs</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Convert long URLs into short, shareable links.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/terminal')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 rounded-xl">
                <Terminal className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Terminal</div>
                <div className="text-sm text-slate-600">Execute safe commands</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Run terminal commands with command logging and history.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/codehealth')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Code className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Code Health</div>
                <div className="text-sm text-slate-600">Code quality analyzer</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Analyze code quality and find lint issues.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/uuid-generator')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Sparkles className="w-7 h-7 text-pink-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">UUID Generator</div>
                <div className="text-sm text-slate-600">Generate unique IDs</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Generate UUID v4 identifiers for your applications.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/base64-tool')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Shuffle className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Base64 Tool</div>
                <div className="text-sm text-slate-600">Encode/Decode Base64</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Encode text to Base64 or decode Base64 to text instantly.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/json-formatter')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FileJson className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">JSON Formatter</div>
                <div className="text-sm text-slate-600">Format & Validate JSON</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Format, validate, and minify JSON data with ease.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/password-generator')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Shield className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Password Generator</div>
                <div className="text-sm text-slate-600">Secure password creator</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Generate strong, secure passwords with custom options.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/jwt-decoder')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Unlock className="w-7 h-7 text-cyan-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">JWT Decoder</div>
                <div className="text-sm text-slate-600">Decode JSON Web Tokens</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Inspect and decode JWT tokens to view header and payload claims.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/url-encoder')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Globe className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">URL Encoder</div>
                <div className="text-sm text-slate-600">URL encoding tool</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Encode and decode URLs and URL parameters.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/hash-generator')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-lime-100 rounded-xl">
                <Hash className="w-7 h-7 text-lime-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Hash Generator</div>
                <div className="text-sm text-slate-600">SHA-256, SHA-512 hashes</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Generate cryptographic hashes for any text.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/regex-tester')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Bug className="w-7 h-7 text-violet-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Regex Tester</div>
                <div className="text-sm text-slate-600">Test regular expressions</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Test and validate regular expressions with sample data.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/html-encoder')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Code2 className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">HTML Encoder</div>
                <div className="text-sm text-slate-600">Encode special characters</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Convert special characters to HTML entities.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/color-converter')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-fuchsia-100 rounded-xl">
                <Palette className="w-7 h-7 text-fuchsia-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Color Converter</div>
                <div className="text-sm text-slate-600">HEX ↔ RGB ↔ HSL</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Convert between color formats with live preview.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/csv-to-json')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FileSpreadsheet className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">CSV ↔ JSON</div>
                <div className="text-sm text-slate-600">Convert data formats</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Convert between CSV and JSON formats.
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/lorem-generator')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-stone-100 rounded-xl">
                <Type className="w-7 h-7 text-stone-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Lorem Ipsum</div>
                <div className="text-sm text-slate-600">Placeholder text generator</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Generate placeholder text for designs.
            </div>
          </button>

         

          <div className="bg-white/40 rounded-2xl border border-dashed border-slate-300 p-6">
            <div className="text-slate-700 font-semibold">More tools coming soon</div>
            <div className="mt-1 text-sm text-slate-600">
              This space will include additional internal services.
            </div>
          </div>
        </div>

        {/* Discover CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Discover Your Most Used Tools</h3>
            <p className="text-slate-600 mb-4">
              See which tools you use most frequently and get personalized recommendations.
            </p>
            <button
              type="button"
              onClick={() => router.push('/discover')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              <Target className="w-4 h-4" />
              Go to Discover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
