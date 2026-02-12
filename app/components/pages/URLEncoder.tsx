'use client';

import { useState } from 'react';
import { Copy, Check, ArrowRightLeft, Globe } from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

export default function URLEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const processURL = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (err) {
      setError(mode === 'decode' ? 'Invalid URL encoded string' : 'Cannot encode this text');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput(input);
    setError('');
  };

  const sampleURL = 'https://example.com/search?q=hello world&page=1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">URL Encoder/Decoder</h1>
          <p className="text-slate-600">Encode or decode URL parameters and special characters</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setMode('encode')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'encode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Encode URL
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Decode URL
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              {mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}
            </label>
            <button
              onClick={() => setInput(sampleURL)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Load Sample
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL to decode...'}
            className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
          />

          <div className="flex justify-center my-4">
            <button
              onClick={swapMode}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Swap input/output"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Result</label>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 resize-none font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={processURL}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            What is URL Encoding?
          </h3>
          <p className="text-sm text-blue-700">
            URL encoding converts characters into a format that can be transmitted over the Internet.
            Special characters like spaces, &, ?, and = are converted to percent-encoded values (e.g., %20 for space).
            This ensures URLs are properly formatted for web browsers and servers.
          </p>
        </div>
      </div>
    </div>
  );
}
