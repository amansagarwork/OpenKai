'use client';

import { useState } from 'react';
import { Copy, Check, Bug, Play } from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const testRegex = () => {
    setError('');
    setMatches([]);
    
    if (!pattern.trim()) {
      setError('Please enter a regex pattern');
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setIsValid(true);
      
      if (testString) {
        const found = testString.match(regex);
        setMatches(found || []);
      }
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
    }
  };

  const copyPattern = async () => {
    await copyToClipboard(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonPatterns = [
    { name: 'Email', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$' },
    { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
    { name: 'IP Address', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
    { name: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Regex Tester</h1>
          <p className="text-slate-600">Test and validate regular expressions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Regex Pattern
            </label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 py-2 bg-slate-100 text-slate-500 rounded-l-lg border border-r-0 border-slate-300 font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 px-4 py-2 border-y border-slate-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <span className="flex items-center px-2 py-2 bg-slate-100 text-slate-500 border-y border-slate-300 font-mono">/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="flags"
                className="w-20 px-2 py-2 border border-slate-300 rounded-r-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Flags: g (global), i (ignore case), m (multiline), s (dotAll)
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Test String
            </label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against the regex..."
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={testRegex}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Test Regex
            </button>
            <button
              onClick={copyPattern}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {isValid && matches.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">
                Found {matches.length} match{matches.length > 1 ? 'es' : ''}
              </h3>
              <div className="space-y-1">
                {matches.slice(0, 20).map((match, index) => (
                  <code key={index} className="block px-3 py-1 bg-white rounded text-sm text-green-800 font-mono">
                    Match {index + 1}: {match}
                  </code>
                ))}
                {matches.length > 20 && (
                  <p className="text-sm text-green-700">...and {matches.length - 20} more</p>
                )}
              </div>
            </div>
          )}

          {isValid && testString && matches.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">No matches found</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-medium text-slate-800 mb-4">Common Patterns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {commonPatterns.map((item) => (
              <button
                key={item.name}
                onClick={() => setPattern(item.pattern)}
                className="text-left p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span className="font-medium text-slate-700">{item.name}</span>
                <code className="block mt-1 text-xs text-slate-500 font-mono truncate">
                  {item.pattern}
                </code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
