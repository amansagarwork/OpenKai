import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Copy, FileText, Loader2, Link2, Trash2 } from 'lucide-react';
import { getToken } from '../../lib/auth';

interface PasteHistoryProps {
  onNavigate: (path: string) => void;
}

type HistoryItem = {
  id: string;
  type: 'paste' | 'url';
  content: string;
  createdAt: string;
  expiresAt?: string | null;
  clicks?: number;
  url: string;
};

export default function PasteHistory({ onNavigate }: PasteHistoryProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [deletingKey, setDeletingKey] = useState('');

  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        onNavigate('/login');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/pastes/history/all`;
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load history');
        }

        setItems(Array.isArray(data?.history) ? data.history : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [onNavigate, token]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1200);
  };

  const deleteItem = async (item: HistoryItem) => {
    if (!token) return;
    
    const itemType = item.type === 'paste' ? 'paste' : 'short URL';
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${itemType}?\n\nID: ${item.id}\nThis action cannot be undone.`);
    
    if (!confirmDelete) return;
    
    const key = `${item.type}-${item.id}`;
    setDeletingKey(key);
    
    try {
      const endpoint = item.type === 'paste' 
        ? `${import.meta.env.VITE_API_BASE_URL}/pastes/${item.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/urls/${item.id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete');
      }

      // Remove from local state
      setItems(prev => prev.filter(i => !(i.type === item.type && i.id === item.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete item');
    } finally {
      setDeletingKey('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <div>
                <div className="text-white font-bold text-xl">My Activity</div>
                <div className="text-blue-100 text-sm">Pastes, short links, and future services</div>
              </div>
            </div>

            {/* <button
              type="button"
              onClick={() => onNavigate('/open-kai')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium transition-colors"
            >
              Back
            </button> */}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-10 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                <div className="text-slate-600">Loading history...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-slate-600">No activity yet.</div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => {
                  const fullUrl = `${window.location.origin}${it.url}`;
                  const isPaste = it.type === 'paste';
                  const tagColor = isPaste ? 'bg-blue-100 text-blue-800' : 'bg-violet-100 text-violet-800';
                  const tagLabel = isPaste ? 'Paste' : 'Short URL';
                  const icon = isPaste ? <FileText className="w-4 h-4" /> : <Link2 className="w-4 h-4" />;
                  return (
                  <div
                    key={`${it.type}-${it.id}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tagColor}`}>
                        {icon}
                        {tagLabel}
                      </span>
                      <div>
                        <div className="font-mono text-slate-900 font-semibold break-all">{it.id}</div>
                        <div className="text-sm text-slate-600">Created {formatDate(it.createdAt)}</div>
                        <div className="text-sm text-slate-500 mt-1 truncate max-w-xl">{it.content}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(it.url)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => copy(fullUrl, `${it.type}-${it.id}`)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          copiedKey === `${it.type}-${it.id}`
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                        {copiedKey === `${it.type}-${it.id}` ? 'Copied!' : 'Copy link'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(it)}
                        disabled={deletingKey === `${it.type}-${it.id}`}
                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {deletingKey === `${it.type}-${it.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deletingKey === `${it.type}-${it.id}` ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
