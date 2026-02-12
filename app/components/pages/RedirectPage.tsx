'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface RedirectPageProps {
  shortId: string;
}

interface UrlInfo {
  short_id: string;
  original_url: string;
  created_at: string;
  clicks: number;
}

export default function RedirectPage({ shortId }: RedirectPageProps) {
  const [urlInfo, setUrlInfo] = useState<UrlInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const fetchUrlInfo = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/urls/${shortId}/info`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Short URL not found');
        }

        setUrlInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load URL');
      } finally {
        setLoading(false);
      }
    };

    fetchUrlInfo();
  }, [shortId]);

  // Countdown timer
  useEffect(() => {
    if (!urlInfo || error || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [urlInfo, error, countdown]);

  // Auto-redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && urlInfo && !redirecting) {
      setRedirecting(true);
      // Small delay to show "Redirecting..." state
      setTimeout(() => {
        window.location.href = urlInfo.original_url;
      }, 500);
    }
  }, [countdown, urlInfo, redirecting]);

  const handleManualRedirect = () => {
    if (urlInfo) {
      window.location.href = urlInfo.original_url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
            <span className="text-slate-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Link Not Found</h2>
          </div>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!urlInfo) return null;

  // Extract domain from URL for display
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const displayUrl = urlInfo.original_url.length > 60 
    ? urlInfo.original_url.substring(0, 60) + '...' 
    : urlInfo.original_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
            <ExternalLink className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">You're being redirected</h1>
          <p className="text-slate-600">
            This link will take you to an external website
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
            Destination
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex-shrink-0">
              <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 mb-1">
                {getDomain(urlInfo.original_url)}
              </div>
              <div className="text-sm text-slate-500 break-all">
                {displayUrl}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {countdown > 0 ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-600 mb-2">{countdown}</div>
              <p className="text-sm text-slate-500">
                Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Redirecting now...</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleManualRedirect}
            className="w-full px-6 py-4 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue to {getDomain(urlInfo.original_url)}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel and Go Home
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Powered by MinusURL</span>
            <span>Created {new Date(urlInfo.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
