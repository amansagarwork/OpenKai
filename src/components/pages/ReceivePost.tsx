import { useMemo, useState } from 'react';
import { Copy, Download, Loader2, FileText, Clock, ArrowLeft, ExternalLink, Calendar, Hourglass } from 'lucide-react';

interface ReceivePostProps {
  onNavigate: (path: string) => void;
}

interface Paste {
  pasteId: string;
  content: string;
  createdAt: string;
  expiresAt: string | null;
}

export default function ReceivePost({ onNavigate }: ReceivePostProps) {
  const [inputId, setInputId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paste, setPaste] = useState<Paste | null>(null);
  const [copied, setCopied] = useState(false);

  const normalizedId = useMemo(() => inputId.trim().toLowerCase(), [inputId]);
  const isValidId = useMemo(() => /^[a-z]{3}[0-9]{3}$/.test(normalizedId), [normalizedId]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${dayName} ${dayNum} ${month} ${hours}:${minutes} ${ampm}`;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    return `Expires in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  const retrieve = async () => {
    setError('');
    setPaste(null);

    if (!normalizedId) {
      setError('Please enter a paste ID');
      return;
    }

    if (!isValidId) {
      setError('Paste ID must be 3 lowercase letters + 3 digits (e.g. abc123)');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/pastes/${normalizedId}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) throw new Error('Paste not found');
        if (response.status === 410) throw new Error('This paste has expired');
        throw new Error('Failed to retrieve paste');
      }

      const data = await response.json();
      setPaste(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to retrieve paste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-white" />
              <div>
                <div className="text-white font-bold text-xl">Retrieve from Online Clipboard</div>
                <div className="text-emerald-100 text-sm">Enter an ID to retrieve a paste</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/open-kai')}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Enter paste ID:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="abc123"
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-mono"
                />

                <button
                  type="button"
                  onClick={retrieve}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Retrieving...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Retrieve
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                {/* Modern Not Found SVG Illustration */}
                <div className="mb-6 flex justify-center">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background circle */}
                    <circle cx="60" cy="60" r="50" fill="#E2E8F0" />
                    {/* Document base */}
                    <rect x="35" y="30" width="40" height="50" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="2"/>
                    {/* Document lines */}
                    <line x1="42" y1="42" x2="68" y2="42" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="42" y1="50" x2="68" y2="50" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="42" y1="58" x2="58" y2="58" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                    {/* Magnifying glass */}
                    <circle cx="72" cy="72" r="16" fill="none" stroke="#3B82F6" strokeWidth="3"/>
                    <line x1="84" y1="84" x2="95" y2="95" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
                    {/* Question mark */}
                    <text x="72" y="78" textAnchor="middle" fill="#3B82F6" fontSize="14" fontWeight="bold">?</text>
                    {/* Cross mark for not found */}
                    <circle cx="85" cy="35" r="12" fill="#EF4444"/>
                    <line x1="80" y1="30" x2="90" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="90" y1="30" x2="80" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Paste Not Found</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                  onClick={() => {setError(''); setInputId('');}}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {paste && (
              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Paste: {paste.pasteId}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                      <Calendar className="w-3 h-3" />
                      Created {formatDate(paste.createdAt)}
                    </div>
                    {paste.expiresAt && (
                      <div className="flex items-center gap-1 text-amber-600 text-sm font-medium mt-1">
                        <Hourglass className="w-3 h-3" />
                        {getTimeRemaining(paste.expiresAt)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/open-kai/${paste.pasteId}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paste.content)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        copied ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="bg-white border-2 border-slate-200 rounded-xl p-4 overflow-y-auto max-h-96">
                    <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap break-words">{paste.content}</pre>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {paste.content.length.toLocaleString()} characters
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil(paste.content.length / 1024)} KB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
