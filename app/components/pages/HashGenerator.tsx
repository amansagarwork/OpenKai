import { useState } from 'react';
import { Copy, Check, Hash, RefreshCw } from 'lucide-react';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateHash = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
    } catch (err) {
      setHash('Error generating hash');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setHash('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Hash Generator</h1>
          <p className="text-slate-600">Generate cryptographic hashes (SHA-256, SHA-512, SHA-1)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Algorithm
            </label>
            <div className="flex gap-2">
              {(['SHA-256', 'SHA-512', 'SHA-1'] as const).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    algorithm === algo
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Input Text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={generateHash}
              disabled={loading || !input.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Hash className="w-5 h-5" />
              )}
              {loading ? 'Generating...' : 'Generate Hash'}
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          {hash && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  {algorithm} Hash
                </label>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <code className="block w-full p-3 bg-white rounded border border-slate-300 font-mono text-sm break-all">
                {hash}
              </code>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-medium text-amber-900 mb-2">About Cryptographic Hashes</h3>
          <p className="text-sm text-amber-700">
            <strong>SHA-256</strong> and <strong>SHA-512</strong> are secure hash algorithms recommended for most applications.
            <strong>SHA-1</strong> is considered weak and should only be used for compatibility with legacy systems.
            Hashes are one-way functions - you cannot reverse them to get the original input.
          </p>
        </div>
      </div>
    </div>
  );
}
