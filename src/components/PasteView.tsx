import { useEffect, useState, useRef } from 'react';
import { FileText, Clock, Loader2, X, Copy, Check } from 'lucide-react';

interface PasteViewProps {
  pasteId: string;
  onNavigate: (path: string) => void;
}

interface Paste {
  pasteId: string;
  content: string;
  createdAt: string;
  expiresAt: string | null;
}

export default function PasteView({ pasteId, onNavigate }: PasteViewProps) {
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    fetchPaste();
  }, [pasteId]);

  const fetchPaste = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/pastes/${pasteId}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Paste not found');
        } else if (response.status === 410) {
          throw new Error('This paste has expired');
        }
        throw new Error('Failed to load paste');
      }

      const data = await response.json();
      setPaste(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load paste');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Loading paste...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isExpired = error === 'This paste has expired';
    const isNotFound = error === 'Paste not found';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-slate-200 text-center">
            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-full ${isExpired ? 'bg-amber-100' : 'bg-red-100'} mb-4`}>
                {isExpired ? (
                  <Clock className="w-8 h-8 text-amber-600" />
                ) : isNotFound ? (
                  <FileText className="w-8 h-8 text-blue-600" />
                ) : (
                  <X className="w-8 h-8 text-red-600" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {isExpired ? 'Paste Expired' : isNotFound ? 'Paste Not Found' : 'Error'}
              </h2>
              
              <p className="text-slate-600 mb-6 max-w-md">
                {isExpired 
                  ? 'This paste has expired and is no longer available. Pastes are automatically deleted after they expire.'
                  : isNotFound
                    ? 'The requested paste could not be found. It may have been deleted or the link might be incorrect.'
                    : error}
              </p>
              
              <div className="w-full max-w-xs mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => onNavigate('/open-paste')}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>Create New Paste</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/')}
                    className="flex-1 px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paste) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">Paste: {paste.pasteId}</h1>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paste.pasteId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-blue-100 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                      title="Copy paste ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-blue-100 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Created {formatDate(paste.createdAt)}</span>
                    {paste.expiresAt && new Date(paste.expiresAt) < new Date() && (
                      <span className="ml-2 text-yellow-200">(Expired)</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('/open-paste')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
              >
                New Paste
              </button>
            </div>

            <div className="p-6">
              {paste.expiresAt && new Date(paste.expiresAt) > new Date() && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-900 font-medium">Expires in {getTimeRemaining(paste.expiresAt)}</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">Content</label>
              </div>

              <pre 
                ref={contentRef}
                className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-lg overflow-auto max-h-[60vh]"
              >
                {paste.content}
              </pre>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{paste.content.length.toLocaleString()} characters</span>
                <span>{Math.ceil(paste.content.length / 1024)} KB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
