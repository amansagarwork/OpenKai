import { useState } from 'react';
import { Link2, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { getToken } from '../../lib/auth';

interface MinusURLProps {
  onNavigate: (path: string) => void;
}

interface ShortenedURL {
  shortId: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
}

// URL validation and security check
function validateUrl(input: string): { valid: boolean; normalized: string; error?: string } {
  let url = input.trim();
  
  if (!url) {
    return { valid: false, normalized: '', error: 'Please enter a URL' };
  }

  // Auto-add https if no protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    
    // Check for valid protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, normalized: '', error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Check for localhost/private IPs (security)
    const hostname = parsed.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '[::1]',
      '[::]',
    ];
    
    // Check for private IP ranges
    const privateIpPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^127\./,
      /^fc00:/i,
      /^fe80:/i,
    ];
    
    if (blockedHosts.includes(hostname) || privateIpPatterns.some(p => p.test(hostname))) {
      return { valid: false, normalized: '', error: 'URLs pointing to localhost or private networks are not allowed for security reasons' };
    }

    // Block dangerous file extensions
    const pathname = parsed.pathname.toLowerCase();
    const dangerousExtensions = ['.exe', '.dll', '.bat', '.cmd', '.sh', '.zip', '.rar', '.tar.gz', '.js', '.vbs', '.ps1', '.msi', '.dmg', '.apk'];
    if (dangerousExtensions.some(ext => pathname.endsWith(ext))) {
      return { valid: false, normalized: '', error: 'URLs with executable or archive file extensions are not allowed' };
    }

    // Check URL length
    if (url.length > 2048) {
      return { valid: false, normalized: '', error: 'URL is too long (max 2048 characters)' };
    }

    return { valid: true, normalized: url };
  } catch {
    return { valid: false, normalized: '', error: 'Please enter a valid URL (e.g., https://example.com)' };
  }
}

export default function MinusURL({ }: MinusURLProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortened, setShortened] = useState<ShortenedURL | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    // Validate URL with security checks
    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    const urlToShorten = validation.normalized;

    setLoading(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/urls`;
      const token = getToken();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: urlToShorten }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to shorten URL');
      }

      setShortened({
        shortId: data.shortId,
        originalUrl: data.originalUrl,
        shortUrl: data.shortUrl,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (shortened) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-violet-700 flex items-center gap-3">
              <Link2 className="w-6 h-6 text-white" />
              <div>
                <div className="text-white font-bold text-xl">MinusURL</div>
                <div className="text-violet-100 text-sm">URL Shortener</div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-green-900">URL Shortened!</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Short URL:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shortened.shortUrl}
                        readOnly
                        className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(shortened.shortUrl)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          copied 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Original URL:</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 text-sm truncate">{shortened.originalUrl}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShortened(null);
                  setUrl('');
                }}
                className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
              >
                Shorten Another URL
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-violet-700 flex items-center gap-3">
            <Link2 className="w-6 h-6 text-white" />
            <div>
              <div className="text-white font-bold text-xl">MinusURL</div>
              <div className="text-violet-100 text-sm">Shorten long URLs instantly</div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter a long URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url..."
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleShorten}
                  disabled={loading || !url.trim()}
                  className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Shortening...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7l9 0l0 9" /><path d="M16 7l-9 9" /></svg>
                      Shorten
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Paste a long URL and get a short, shareable link
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Features:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Shorten any URL instantly</li>
                <li>• Easy to share and remember</li>
                <li>• Perfect for social media and messages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
