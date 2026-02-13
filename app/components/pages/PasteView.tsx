'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Clock, Loader2, X, Check, Download, Image as ImageIcon, File, Share2, LinkIcon, Copy } from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

interface Paste {
  pasteId: string;
  content: string;
  contentType: string;
  type: 'text' | 'image' | 'file';
  hasFile: boolean;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  downloadUrl?: string;
  slug?: string;
  createdAt: string;
  expiresAt: string | null;
}

export default function PasteView() {
  const router = useRouter();
  const params = useParams();
  const pasteId = params?.id as string || params?.pasteId as string;
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const contentRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    fetchPaste();
  }, [pasteId]);

  const fetchPaste = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/pastes/${pasteId}`;

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
      <div className="min-h-screen">
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
      <div className="min-h-screen">
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
                    onClick={() => router.push('/open-kai')}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>Create New Paste</span>
                  </button>
                  <button
                    onClick={() => router.push('/')}
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
    <div className="min-h-screen">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">{paste.fileName || 'Paste'}</h1>
                    <button
                      onClick={async () => {
                        await copyToClipboard(paste.pasteId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-blue-100 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                      title="Copy paste ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Share2 className="w-4 h-4" />
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
                onClick={() => router.push('/open-kai')}
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

              {/* Image Display */}
              {paste.type === 'image' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image
                    </label>
                    {paste.fileUrl ? (
                      <a
                        href={paste.fileUrl}
                        download={paste.fileName}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500">Not available</span>
                    )}
                  </div>
                  {paste.fileUrl ? (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <img
                        src={paste.fileUrl}
                        alt={paste.fileName || 'Uploaded image'}
                        className="max-w-full max-h-[60vh] mx-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-8 border border-slate-200 text-center">
                      {/* Image Not Found SVG */}
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                        <rect x="20" y="25" width="60" height="50" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
                        <circle cx="40" cy="45" r="8" fill="#3B82F6"/>
                        <path d="M20 65L35 50L45 60L55 45L80 70" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="75" cy="30" r="12" fill="#EF4444"/>
                        <line x1="70" y1="25" x2="80" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="80" y1="25" x2="70" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <p className="text-slate-600 font-medium">Image not found</p>
                      <p className="text-sm text-slate-500 mt-1">The image may have expired or been deleted</p>
                    </div>
                  )}
                  {paste.fileName && (
                    <p className="text-sm text-slate-500">{paste.fileName} ({(paste.fileSize! / 1024).toFixed(1)} KB)</p>
                  )}
                </div>
              )}

              {/* File Display */}
              {paste.type === 'file' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <File className="w-4 h-4" />
                      File
                    </label>
                  </div>
                  {paste.downloadUrl ? (
                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <File className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{paste.fileName || 'Unnamed file'}</p>
                        <p className="text-sm text-slate-500">{(paste.fileSize! / 1024).toFixed(1)} KB</p>
                      </div>
                      <a
                        href={paste.downloadUrl}
                        download={paste.fileName}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-8 border border-slate-200 text-center">
                      {/* File Not Found SVG */}
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                        <rect x="25" y="20" width="50" height="60" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
                        <path d="M35 35H65" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M35 45H55" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M35 55H60" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="75" cy="25" r="12" fill="#EF4444"/>
                        <line x1="70" y1="20" x2="80" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="80" y1="20" x2="70" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <p className="text-slate-600 font-medium">File not found</p>
                      <p className="text-sm text-slate-500 mt-1">The file may have expired or been deleted</p>
                    </div>
                  )}
                </div>
              )}

              {/* Text Display */}
              {paste.type === 'text' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Share URL
                      </p>
                      <button
                        onClick={async () => {
                          await copyToClipboard(`${window.location.origin}/open-kai/${paste.slug || paste.pasteId}`);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <a 
                      href={`/open-kai/${paste.slug || paste.pasteId}`}
                      className="text-lg font-mono font-bold text-blue-600 hover:underline truncate block"
                    >
                      /open-kai/{paste.slug || paste.pasteId}
                    </a>
                    {paste.slug && paste.slug !== paste.pasteId && (
                      <p className="text-xs text-blue-500 mt-1">Paste ID: {paste.pasteId}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">Content</label>
                    <button
                      onClick={async () => {
                        await copyToClipboard(paste.content);
                        setContentCopied(true);
                        setTimeout(() => setContentCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {contentCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {contentCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <pre 
                    ref={contentRef}
                    className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-lg overflow-auto max-h-[60vh]"
                  >
                    {paste.content}
                  </pre>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{paste.content.trim().split(/\s+/).length} words, {paste.content.length.toLocaleString()} characters</span>
                    <span>{Math.ceil(paste.content.length / 1024)} KB</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
