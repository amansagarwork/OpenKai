'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code, CheckCircle, AlertTriangle, AlertCircle, Info, FileCode, Zap } from 'lucide-react';
import { getToken } from '../../lib/auth';

interface CodeHealthProps {
  // onNavigate: (path: string) => void;
}

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

export default function CodeHealth() {
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

  // Auto-resize textarea and sync line numbers container height
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

  // Auto-clear highlight after 4 seconds
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

  // Sync scroll between line numbers and textarea
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

  // Update current visible line (top-most visible line)
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbersContainer = lineNumbersRef.current;

    if (!textarea || !lineNumbersContainer) return;

    const updateVisibleLine = () => {
      const lineElements = lineNumbersContainer.querySelectorAll('div');
      if (!lineElements.length) {
        setCurrentVisibleLine(1);
        return;
      }

      const textareaRect = textarea.getBoundingClientRect();
      const targetY = textareaRect.top + 40; // offset to catch the line near the top

      let closestLine = 1;
      let minDistance = Infinity;

      lineElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - targetY);
        if (distance < minDistance) {
          minDistance = distance;
          closestLine = index + 1;
        }
      });

      setCurrentVisibleLine(closestLine);
    };

    textarea.addEventListener('scroll', updateVisibleLine);
    window.addEventListener('resize', updateVisibleLine);

    const timer = setTimeout(updateVisibleLine, 150);

    return () => {
      textarea.removeEventListener('scroll', updateVisibleLine);
      window.removeEventListener('resize', updateVisibleLine);
      clearTimeout(timer);
    };
  }, [code]);

  const navigateToLine = (targetLine: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 1. Focus textarea
    textarea.focus();

    // 2. Calculate exact character position at start of target line
    const lines = code.split('\n');
    let charCount = 0;
    for (let i = 0; i < targetLine - 1; i++) {
      charCount += lines[i].length + 1; // +1 for newline
    }

    // Move cursor to start of the line
    textarea.setSelectionRange(charCount, charCount);

    // 3. Scroll to the line (accurate)
    const lineHeight = 24;           // 1.5rem = 24px
    const paddingTop = 12;           // py-3 = 12px
    const desiredTopOffset = 60;     // leave some space at the top

    const targetScroll = (targetLine - 1) * lineHeight + paddingTop - desiredTopOffset;
    textarea.scrollTop = Math.max(0, targetScroll);

    // 4. Set highlight
    setHighlightedLine(targetLine);

    // 5. Update current visible line immediately
    setTimeout(() => {
      if (textarea) {
        const scrollTop = textarea.scrollTop;
        const visibleLine = Math.floor((scrollTop + desiredTopOffset) / lineHeight) + 1;
        setCurrentVisibleLine(visibleLine);
      }
    }, 80);
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
    setSeverityFilter(['error', 'warning', 'info']); // Reset filter on new check

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
    setSeverityFilter(['error', 'warning', 'info']); // Reset filter
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

  const sampleCode = `// Sample JavaScript code for testing
var x = 1;  // Line 1 - var should warn: use let/const
console.log("Processing item:", x);  // Line 2 - console.log should warn
eval("1 + 1");  // Line 3 - eval should error
function calculateTotal(items) {  // Line 4 - missing type hints
  var total = 0;  // Line 5 - var should warn
  
  for (var i = 0; i < items.length; i++) {  // Line 6 - var should warn
    console.log("Processing item:", i);  // Line 7 - console.log should warn
    total += items[i].price;
    
    if (items[i].discount == null) {  // Line 9 - == should warn: use ===
      console.log("No discount");
    }
  }
  
  // TODO: Add tax calculation  // Line 13 - TODO should info
  // FIXME: Handle edge cases  // Line 14 - FIXME should warn
  
  return total;
}
// Test broken link
fetch("https://this-domain-does-not-exist-12345.com/missing-page");  // Line 18 - broken link should warn
// Test suspicious TLD
fetch("https://example.xyz/test");  // Line 21 - .xyz TLD should warn
// Test localhost link
fetch("http://localhost:3000/api");  // Line 24 - localhost should warn
// Test URL shortener
fetch("https://bit.ly/abc123");  // Line 27 - URL shortener should info`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Code Health</h1>
                <p className="text-indigo-200 text-sm">Code health checker and quality analyzer</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Back to Tools
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Input Section */}
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

            <div className="p-5 space-y-4 relative">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Filename (optional, e.g., example.tsx)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              />

              {/* Current visible line indicator */}
              {code.trim() && (
                <div className="absolute top-4 right-6 z-30 bg-indigo-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-indigo-500/30 backdrop-blur-sm flex items-center gap-1.5">
                  <span className="text-indigo-200 text-[10px]">current</span>
                  Line <span className="font-bold">{currentVisibleLine}</span>
                </div>
              )}

              <div className="relative" ref={codeContainerRef}>
                <div className="flex border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
                  {/* Line Numbers */}
                  <div
                    ref={lineNumbersRef}
                    className="bg-slate-800 text-slate-400 text-xs font-mono py-3 px-3 text-right select-none overflow-y-auto scrollbar-hidden flex-shrink-0"
                    style={{ minWidth: '3.5rem' }}
                  >
                    {code.split('\n').map((_, i) => (
                      <div
                        key={i}
                        onClick={() => navigateToLine(i + 1)}
                        className={`cursor-pointer h-6 leading-6 transition-colors flex items-center justify-end min-w-[2.5rem] ${
                          highlightedLine === i + 1
                            ? 'text-white font-bold bg-indigo-700/50'
                            : 'hover:text-slate-200'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Code Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    className="flex-1 px-4 py-3 font-mono text-sm bg-transparent text-slate-200 focus:outline-none resize-none overflow-y-auto"
                    spellCheck={false}
                    style={{
                      lineHeight: '1.5rem',
                      minHeight: '40vh',
                      maxHeight: '60vh',
                    }}
                  />
                </div>

                {/* Highlight overlay */}
                {highlightedLine !== null && (
                  <div
                    className="absolute left-0 right-0 pointer-events-none z-10 border-l-4 border-indigo-500 bg-indigo-500/15 transition-all duration-150"
                    style={{
                      top: `${(highlightedLine - 1) * 24 + 12}px`, // 24px line height + 12px padding-top
                      height: '24px',
                    }}
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifyLinks}
                    onChange={(e) => setVerifyLinks(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Verify URLs (real HTTP check)</span>
                </label>
              </div>

              <button
                onClick={checkCode}
                disabled={loading || !code.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {verifyingLinks ? 'Verifying Links...' : 'Analyzing...'}
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

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-slate-500" />
                <h2 className="font-semibold text-slate-900">Analysis Results</h2>
              </div>
              {result && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              )}
            </div>

            {!result ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Analysis Yet</h3>
                <p className="text-slate-500">Paste your code and click "Check Code" to analyze</p>
              </div>
            ) : (
              <div className="p-5 space-y-6">
                {/* Score Card */}
                <div className={`rounded-xl p-6 ${getScoreBg(result.summary.score)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Code Quality Score</div>
                      <div className={`text-4xl font-bold ${getScoreColor(result.summary.score)}`}>
                        {result.summary.score}/100
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Rating: <span className="font-semibold">{result.summary.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="font-semibold">{result.summary.errors}</span>
                          <span className="text-slate-500">errors</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold">{result.summary.warnings}</span>
                          <span className="text-slate-500">warnings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">{result.summary.info}</span>
                          <span className="text-slate-500">info</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-slate-500">
                        Detected: <span className="font-medium capitalize">{result.language}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-slate-900">{result.metrics.lines}</div>
                    <div className="text-sm text-slate-600 mt-1">Lines</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-slate-900">{result.metrics.characters}</div>
                    <div className="text-sm text-slate-600 mt-1">Chars</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-slate-900">{result.metrics.words}</div>
                    <div className="text-sm text-slate-600 mt-1">Words</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-slate-900">{result.metrics.functions}</div>
                    <div className="text-sm text-slate-600 mt-1">Funcs</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-slate-900">{result.metrics.comments}</div>
                    <div className="text-sm text-slate-600 mt-1">Comments</div>
                  </div>
                </div>

                {/* Link Verification */}
                {result.links && result.links.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Link Verification</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>{result.links.filter(l => l.ok).length} working</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span>{result.summary.brokenLinks} broken</span>
                        </div>
                        <div className="text-slate-600">
                          Total: {result.summary.totalLinks} links
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {result.links.map((link, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              link.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {link.ok ? (
                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                              )}
                              <span className="text-sm text-slate-700 truncate">
                                {link.url}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 shrink-0 ml-4">
                              {link.status ? `Status ${link.status}` : link.error || 'Failed'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Issues */}
                {showDetails && result.issues.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Issues Found</h3>
                      
                      {/* Severity Filter */}
                      <div className="flex items-center gap-2">
                        {[
                          { key: 'error', label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
                          { key: 'warning', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                          { key: 'info', label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                        ].map(({ key, label, color }) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSeverityFilter(prev =>
                                prev.includes(key)
                                  ? prev.filter(s => s !== key)
                                  : [...prev, key]
                              );
                            }}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                              severityFilter.includes(key)
                                ? color
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                      {result.issues
                        .filter(issue => severityFilter.includes(issue.severity))
                        .map((issue, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 p-4 rounded-lg border ${
                            issue.severity === 'error'
                              ? 'bg-red-50 border-red-200'
                              : issue.severity === 'warning'
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="mt-0.5">{getSeverityIcon(issue.severity)}</div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 text-xs text-slate-600 mb-1">
                              <span className="font-mono font-medium">
                                L{issue.line}:{issue.column}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  issue.severity === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : issue.severity === 'warning'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-slate-500">({issue.rule})</span>
                            </div>
                            <p className="text-slate-800">{issue.message}</p>
                          </div>

                          <button
                            onClick={() => navigateToLine(issue.line)}
                            className="shrink-0 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                            title="Jump to line"
                          >
                            Go
                          </button>
                        </div>
                      ))}
                      {result.issues.filter(issue => severityFilter.includes(issue.severity)).length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          No issues match the selected filter.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.issues.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Perfect! No issues found
                    </h3>
                    <p className="text-slate-600">
                      Your code looks clean and well-structured.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}