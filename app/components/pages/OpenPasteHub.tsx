'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Download, FileText, Image as ImageIcon, Upload, Clock, X, Copy, Check } from 'lucide-react';

export default function OpenPasteHub() {
  const router = useRouter();
  type ContentType = 'text' | 'image' | 'file';
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  const [textContent, setTextContent] = useState('');
  const [expiresIn, setExpiresIn] = useState('5m');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{id: string; url: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setError('');
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be less than 5MB');
        return;
      }
      setError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add content based on active tab
      if (activeTab === 'text') {
        formData.append('content', textContent);
      } else if (activeTab === 'image' && imageFile) {
        formData.append('file', imageFile);
        formData.append('content', textContent || 'Image upload');
      } else if (activeTab === 'file' && selectedFile) {
        formData.append('file', selectedFile);
        formData.append('content', textContent || 'File upload');
      }

      // Add expiration
      formData.append('expiresIn', expiresIn);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/pastes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload');
      }

      const data = await response.json();
      setResult({
        id: data.pasteId,
        url: data.url
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please copy manually.');
    }
  };

  const reset = () => {
    setTextContent('');
    setImagePreview(null);
    setImageFile(null);
    setSelectedFile(null);
    setResult(null);
    setCopied(false);
    setError('');
  };

  if (result) {
    return (
      <div className="min-h-screen">
        <div className="px-6 py-10 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Sent Successfully!</h2>
                  <p className="text-slate-600">Your content is ready to share</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Share Link</label>
                  <div className="flex gap-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-700 font-mono text-sm hover:bg-blue-100 hover:border-blue-300 transition-all truncate"
                    >
                      {result.url}
                    </a>
                    <button
                      onClick={() => copyToClipboard(result.url)}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Paste ID</p>
                  <p className="text-2xl font-mono font-bold text-slate-800">{result.id}</p>
                </div>

                <button
                  onClick={reset}
                  className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                >
                  Send Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">OpenPaste</h1>
            <p className="mt-1 text-slate-600">Send text, images, or files using a short ID</p>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xl">
            {/* Tab Navigation */}
            <div className="grid grid-cols-3 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Send Text</span>
                <span className="sm:hidden">Text</span>
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'image'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Send Image</span>
                <span className="sm:hidden">Image</span>
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'file'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Send File</span>
                <span className="sm:hidden">File</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Paste your text</label>
                  </div>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="w-full h-48 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none font-mono text-sm"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expires in
                    </label>
                    <select
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800"
                    >
                      <option value="1m">1 minute</option>
                      <option value="2m">2 minutes</option>
                      <option value="5m">5 minutes</option>
                      <option value="10m">10 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="1d">1 day</option>
                      <option value="1w">1 week</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!textContent.trim() || loading}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Text to Online Clipboard
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Upload image</label>
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <ImageIcon className="w-12 h-12 text-slate-400 mb-3" />
                      <p className="text-slate-600 font-medium">Click to upload or paste image</p>
                      <p className="text-sm text-slate-500">Supports PNG, JPG, GIF</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expires in
                    </label>
                    <select
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800"
                    >
                      <option value="1m">1 minute</option>
                      <option value="2m">2 minutes</option>
                      <option value="5m">5 minutes</option>
                      <option value="10m">10 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="1d">1 day</option>
                      <option value="1w">1 week</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!imagePreview || loading}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Image to Online Clipboard
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'file' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">Select file</label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <Upload className="w-12 h-12 text-slate-400 mb-3" />
                      <p className="text-slate-600 font-medium">Click to select file</p>
                      <p className="text-sm text-slate-500">Images, PDFs, ZIP, any file up to 5MB</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expires in
                    </label>
                    <select
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800"
                    >
                      <option value="1m">1 minute</option>
                      <option value="2m">2 minutes</option>
                      <option value="5m">5 minutes</option>
                      <option value="10m">10 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="1d">1 day</option>
                      <option value="1w">1 week</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || loading}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send File to Online Clipboard
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/receive-post')}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-blue-400 text-blue-600 hover:text-blue-800 hover:bg-blue-50 hover:border-blue-600 rounded-xl transition-all font-medium"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  Receive Content
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-slate-500 text-sm">
            OpenPaste is one service inside A Tools.
          </div>
        </div>
      </div>
    </div>
  );
}
