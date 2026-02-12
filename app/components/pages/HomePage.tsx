'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Clock, Link2, Loader2 } from 'lucide-react';
import { getToken } from '../../lib/auth';
import { copyToClipboard } from '../../lib/clipboard';

export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [expiresIn, setExpiresIn] = useState('5m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');
  const [deleteToken, setDeleteToken] = useState('');

  const handleCreate = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/pastes`;
      const token = getToken();
      
      console.log('API URL:', apiUrl);
      console.log('API_BASE_URL env:', process.env.NEXT_PUBLIC_API_BASE_URL);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          content,
          expiresIn: expiresIn === 'never' ? undefined : expiresIn,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create paste');
      }

      const data = await response.json();
      setCreatedUrl(`${window.location.origin}/open-kai/${data.pasteId}`);
      setDeleteToken(data.deleteToken);
      router.push(`/open-kai/${data.pasteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };

  if (createdUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Paste Created!</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Share this link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createdUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopy(createdUrl)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              {deleteToken && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 mb-2">
                    Delete Token (save this!)
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deleteToken}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded text-amber-900 font-mono text-xs"
                    />
                    <button
                      onClick={() => handleCopy(deleteToken)}
                      className="px-4 py-2 bg-amber-600 text-white rounded font-medium hover:bg-amber-700 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setCreatedUrl('');
                  setDeleteToken('');
                  setContent('');
                }}
                className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Create Another Paste
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">OpenPaste</h1>
              <p className="text-slate-600">Share text snippets instantly with your team</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste your content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text, logs, configs, or notes here..."
                className="w-full h-64 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none font-mono text-sm text-slate-800"
                maxLength={1024 * 1024}
              />
              <p className="text-xs text-slate-500 mt-2">
                {content.length.toLocaleString()} / 1,048,576 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expires in
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800"
              >
                <option value="1m">1 minute</option>
                <option value="5m">5 minutes</option>
                <option value="10m">10 minutes</option>
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
                <option value="1w">1 week</option>
                <option value="never">Never</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading || !content.trim()}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg>
                  Create Paste
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
