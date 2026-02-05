import { useMemo, useState } from 'react';
import { AlertCircle, Copy, Download, Loader2 } from 'lucide-react';

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
              onClick={() => onNavigate('/open-paste')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium transition-colors"
            >
              Back
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Enter id of the text you want retrieved:</label>
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
                     <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-down-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 7l-10 10" /><path d="M16 17l-9 0l0 -9" /></svg>
                      Retrieve
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {paste && (
              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 font-semibold">Paste: {paste.pasteId}</div>
                    <div className="text-slate-500 text-sm">Created {formatDate(paste.createdAt)}</div>
                    {paste.expiresAt && (
                      <div className="text-amber-600 text-sm font-medium mt-1">
                        {getTimeRemaining(paste.expiresAt)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/open-paste/${paste.pasteId}`)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
                    >
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
                    <span>{paste.content.length.toLocaleString()} characters</span>
                    <span>{Math.ceil(paste.content.length / 1024)} KB</span>
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
