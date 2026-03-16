'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code, CheckCircle, AlertTriangle, AlertCircle, Info, FileCode, Zap } from 'lucide-react';
import { getToken } from '../../lib/auth';

interface LintIssue {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule: string;
}

interface LintResult {
  language: string;
  issues: LintIssue[];
  metrics: {
    lines: number;
    characters: number;
    words: number;
    functions: number;
    comments: number;
  };
  links: Array<{ url: string; status: number | null; ok: boolean; error?: string }>;
  summary: {
    score: number;
    total: number;
    errors: number;
    warnings: number;
    info: number;
    rating: string;
    brokenLinks: number;
    totalLinks: number;
  };
}

export default function CodeHealth({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState<LintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(true);
  const [verifyLinks, setVerifyLinks] = useState(false);
  const [verifyingLinks, setVerifyingLinks] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [currentVisibleLine, setCurrentVisibleLine] = useState<number>(1);
  const [severityFilter, setSeverityFilter] = useState<string[]>(['error', 'warning', 'info']);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = window.innerHeight * 0.6;
      const minHeight = window.innerHeight * 0.4;
      const newHeight = Math.min(scrollHeight, maxHeight);
      const finalHeight = Math.max(newHeight, minHeight);
      textarea.style.height = `${finalHeight}px`;
      if (lineNumbers) {
        lineNumbers.style.height = `${finalHeight}px`;
      }
    }
  }, [code]);

  useEffect(() => {
    if (highlightedLine !== null) {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedLine(null);
      }, 4000);
    }
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, [highlightedLine]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea || !lineNumbers) return;
    const syncScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    };
    textarea.addEventListener('scroll', syncScroll);
    return () => {
      textarea.removeEventListener('scroll', syncScroll);
    };
  }, []);

  const navigateToLine = (targetLine: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    const lines = code.split('\n');
    let charCount = 0;
    for (let i = 0; i < targetLine - 1; i++) {
      charCount += lines[i].length + 1;
    }
    textarea.setSelectionRange(charCount, charCount);
    const lineHeight = 24;
    const paddingTop = 12;
    const desiredTopOffset = 60;
    const targetScroll = (targetLine - 1) * lineHeight + paddingTop - desiredTopOffset;
    textarea.scrollTop = Math.max(0, targetScroll);
    setHighlightedLine(targetLine);
  };

  const checkCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to check');
      return;
    }
    setLoading(true);
    setVerifyingLinks(verifyLinks);
    setError('');
    setHighlightedLine(null);
    setSeverityFilter(['error', 'warning', 'info']);
    try {
      const token = getToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/lint/check`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, filename: filename || undefined, verifyLinks }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to analyze code');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const clearCode = () => {
    setCode('');
    setFilename('');
    setResult(null);
    setError('');
    setHighlightedLine(null);
    setCurrentVisibleLine(1);
    setSeverityFilter(['error', 'warning', 'info']);
    textareaRef.current?.focus();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const sampleCode = `// Sample code`;

  return (
    <div className={embedded ? "h-full overflow-y-auto p-6" : "h-full overflow-y-auto p-6"}>
      <div className={embedded ? "space-y-6 w-full" : "space-y-6 max-w-6xl mx-auto"}>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900">Code Input</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode(sampleCode)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Load Sample
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={clearCode}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Filename (optional)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <div className="relative" ref={codeContainerRef}>
              <div className="flex border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
                <div
                  ref={lineNumbersRef}
                  className="bg-slate-800 text-slate-400 text-xs font-mono py-3 px-3 text-right select-none overflow-y-auto flex-shrink-0"
                  style={{ minWidth: '3.5rem' }}
                >
                  {code.split('\n').map((_, i) => (
                    <div
                      key={i}
                      onClick={() => navigateToLine(i + 1)}
                      className={`cursor-pointer h-6 leading-6 ${highlightedLine === i + 1 ? 'text-white font-bold bg-indigo-700/50' : 'hover:text-slate-200'}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="flex-1 px-4 py-3 font-mono text-sm bg-transparent text-slate-200 focus:outline-none resize-none overflow-y-auto"
                  spellCheck={false}
                  style={{ lineHeight: '1.5rem', minHeight: '40vh', maxHeight: '60vh' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifyLinks}
                  onChange={(e) => setVerifyLinks(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm text-slate-700">Verify URLs</span>
              </label>
            </div>
            <button
              onClick={checkCode}
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Check Code
                </>
              )}
            </button>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Analysis Results</h2>
            </div>
            <div className="p-5 space-y-6">
              <div className={`rounded-xl p-6 ${getScoreBg(result.summary.score)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Code Quality Score</div>
                    <div className={`text-4xl font-bold ${getScoreColor(result.summary.score)}`}>
                      {result.summary.score}/100
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm">
                      <span>{result.summary.errors} errors</span>
                      <span>{result.summary.warnings} warnings</span>
                      <span>{result.summary.info} info</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
