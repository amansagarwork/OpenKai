'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Link2, Terminal, Code, Sparkles, Shuffle, FileJson, 
  Shield, Unlock, Globe, Hash, Bug, Code2, Palette, FileSpreadsheet, 
  Type, Target, Search, Grid3X3, TerminalSquare, Fingerprint, Lock, Eye,
  Calculator, Braces, Quote, Table, Wand2, FileCode, Layers, Filter
} from 'lucide-react';

interface Tool {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  category: string;
  subcategory: string;
  tags: string[];
}

const categories = [
  { id: 'all', name: 'All Tools', icon: <Grid3X3 className="w-5 h-5" /> },
  { id: 'productivity', name: 'Productivity', icon: <Target className="w-5 h-5" /> },
  { id: 'development', name: 'Development', icon: <Code className="w-5 h-5" /> },
  { id: 'security', name: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: 'data', name: 'Data & Files', icon: <FileSpreadsheet className="w-5 h-5" /> },
  { id: 'text', name: 'Text Tools', icon: <Type className="w-5 h-5" /> },
];

const tools: Tool[] = [
  // Productivity
  {
    name: 'OpenPaste',
    path: '/open-kai',
    icon: <FileText className="w-6 h-6" />,
    description: 'Share text snippets, code, and files instantly with shareable links',
    color: 'blue',
    category: 'productivity',
    subcategory: 'Sharing',
    tags: ['share', 'text', 'code', 'paste', 'collaboration']
  },
  {
    name: 'MinusURL',
    path: '/minusurl',
    icon: <Link2 className="w-6 h-6" />,
    description: 'Shorten long URLs into compact, shareable links',
    color: 'violet',
    category: 'productivity',
    subcategory: 'Sharing',
    tags: ['url', 'shorten', 'link', 'share']
  },
  {
    name: 'Terminal',
    path: '/terminal',
    icon: <TerminalSquare className="w-6 h-6" />,
    description: 'Safe command execution environment for quick tasks',
    color: 'slate',
    category: 'productivity',
    subcategory: 'Utilities',
    tags: ['terminal', 'command', 'bash', 'shell']
  },
  {
    name: 'Code Health',
    path: '/codehealth',
    icon: <Bug className="w-6 h-6" />,
    description: 'Analyze code quality, complexity, and maintainability',
    color: 'indigo',
    category: 'productivity',
    subcategory: 'Analysis',
    tags: ['code', 'quality', 'analysis', 'health']
  },
  // Development
  {
    name: 'UUID Generator',
    path: '/uuid-generator',
    icon: <Fingerprint className="w-6 h-6" />,
    description: 'Generate unique identifiers (UUID v4, v1)',
    color: 'pink',
    category: 'development',
    subcategory: 'Generators',
    tags: ['uuid', 'guid', 'id', 'generate', 'unique']
  },
  {
    name: 'JSON Formatter',
    path: '/json-formatter',
    icon: <FileJson className="w-6 h-6" />,
    description: 'Format, validate, and beautify JSON data',
    color: 'emerald',
    category: 'development',
    subcategory: 'Formatters',
    tags: ['json', 'format', 'validate', 'beautify']
  },
  {
    name: 'Base64 Tool',
    path: '/base64-tool',
    icon: <Shuffle className="w-6 h-6" />,
    description: 'Encode and decode Base64 strings and files',
    color: 'amber',
    category: 'development',
    subcategory: 'Encoders',
    tags: ['base64', 'encode', 'decode', 'convert']
  },
  {
    name: 'JWT Decoder',
    path: '/jwt-decoder',
    icon: <Lock className="w-6 h-6" />,
    description: 'Decode and inspect JSON Web Tokens',
    color: 'cyan',
    category: 'development',
    subcategory: 'Security Dev',
    tags: ['jwt', 'token', 'decode', 'auth']
  },
  {
    name: 'Hash Generator',
    path: '/hash-generator',
    icon: <Hash className="w-6 h-6" />,
    description: 'Generate SHA-256, SHA-512, MD5 hashes',
    color: 'lime',
    category: 'development',
    subcategory: 'Security Dev',
    tags: ['hash', 'sha256', 'sha512', 'md5', 'checksum']
  },
  {
    name: 'URL Encoder',
    path: '/url-encoder',
    icon: <Globe className="w-6 h-6" />,
    description: 'URL encode/decode strings and query parameters',
    color: 'teal',
    category: 'development',
    subcategory: 'Encoders',
    tags: ['url', 'encode', 'decode', 'query', 'percent']
  },
  // Security
  {
    name: 'Password Generator',
    path: '/password-generator',
    icon: <Shield className="w-6 h-6" />,
    description: 'Create secure, random passwords with custom rules',
    color: 'rose',
    category: 'security',
    subcategory: 'Passwords',
    tags: ['password', 'generator', 'secure', 'random']
  },
  {
    name: 'Password Strength',
    path: '/password-strength',
    icon: <Eye className="w-6 h-6" />,
    description: 'Check password strength and entropy',
    color: 'orange',
    category: 'security',
    subcategory: 'Passwords',
    tags: ['password', 'strength', 'check', 'security']
  },
  // Data & Files
  {
    name: 'CSV to JSON',
    path: '/csv-to-json',
    icon: <Table className="w-6 h-6" />,
    description: 'Convert CSV files to JSON format',
    color: 'green',
    category: 'data',
    subcategory: 'Converters',
    tags: ['csv', 'json', 'convert', 'data']
  },
  {
    name: 'SQL Formatter',
    path: '/sql-formatter',
    icon: <FileCode className="w-6 h-6" />,
    description: 'Format and beautify SQL queries',
    color: 'blue',
    category: 'data',
    subcategory: 'Formatters',
    tags: ['sql', 'format', 'query', 'database']
  },
  // Text Tools
  {
    name: 'Lorem Ipsum',
    path: '/lorem-ipsum',
    icon: <Type className="w-6 h-6" />,
    description: 'Generate placeholder text for designs',
    color: 'gray',
    category: 'text',
    subcategory: 'Generators',
    tags: ['lorem', 'ipsum', 'text', 'placeholder']
  },
  {
    name: 'Text Diff',
    path: '/text-diff',
    icon: <Layers className="w-6 h-6" />,
    description: 'Compare two texts and find differences',
    color: 'purple',
    category: 'text',
    subcategory: 'Analysis',
    tags: ['diff', 'compare', 'text', 'difference']
  },
  {
    name: 'Case Converter',
    path: '/case-converter',
    icon: <Wand2 className="w-6 h-6" />,
    description: 'Convert between camelCase, snake_case, kebab-case',
    color: 'yellow',
    category: 'text',
    subcategory: 'Converters',
    tags: ['case', 'convert', 'camel', 'snake', 'kebab']
  },
  {
    name: 'Markdown Preview',
    path: '/markdown-preview',
    icon: <FileText className="w-6 h-6" />,
    description: 'Live preview Markdown with formatting',
    color: 'indigo',
    category: 'text',
    subcategory: 'Preview',
    tags: ['markdown', 'md', 'preview', 'render']
  },
];

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const groupedTools = useMemo(() => {
    const groups: Record<string, Tool[]> = {};
    filteredTools.forEach(tool => {
      if (!groups[tool.subcategory]) {
        groups[tool.subcategory] = [];
      }
      groups[tool.subcategory].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
      blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
      violet: { bg: 'bg-violet-100', icon: 'text-violet-600', border: 'border-violet-200' },
      pink: { bg: 'bg-pink-100', icon: 'text-pink-600', border: 'border-pink-200' },
      emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', border: 'border-emerald-200' },
      amber: { bg: 'bg-amber-100', icon: 'text-amber-600', border: 'border-amber-200' },
      rose: { bg: 'bg-rose-100', icon: 'text-rose-600', border: 'border-rose-200' },
      cyan: { bg: 'bg-cyan-100', icon: 'text-cyan-600', border: 'border-cyan-200' },
      teal: { bg: 'bg-teal-100', icon: 'text-teal-600', border: 'border-teal-200' },
      lime: { bg: 'bg-lime-100', icon: 'text-lime-600', border: 'border-lime-200' },
      slate: { bg: 'bg-slate-100', icon: 'text-slate-600', border: 'border-slate-200' },
      indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600', border: 'border-indigo-200' },
      gray: { bg: 'bg-gray-100', icon: 'text-gray-600', border: 'border-gray-200' },
      orange: { bg: 'bg-orange-100', icon: 'text-orange-600', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-200' },
      green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Discover Tools</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore 15+ powerful tools organized by category. Search by name, description, or tags.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">{filteredTools.length} tools found</span>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Tools by Subcategory */}
        {Object.keys(groupedTools).length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedTools).map(([subcategory, subTools]) => (
              <div key={subcategory}>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  {subcategory}
                  <span className="text-sm font-normal text-slate-500">({subTools.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subTools.map((tool) => {
                    const colors = getColorClasses(tool.color);
                    return (
                      <button
                        key={tool.name}
                        onClick={() => router.push(tool.path)}
                        className="group text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-orange-300 transition-all duration-200 flex flex-col h-full"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2.5 ${colors.bg} rounded-lg ${colors.border} border group-hover:scale-105 transition-transform shrink-0`}>
                            <div className={colors.icon}>
                              {tool.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 text-base leading-tight">{tool.name}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 flex-1">{tool.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {tool.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag} 
                              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No tools found</h3>
            <p className="text-slate-600">Try adjusting your search or category filter</p>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
