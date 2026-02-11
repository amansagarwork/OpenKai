import { useState } from 'react';
import { Copy, Check, ArrowRightLeft } from 'lucide-react';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const processText = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (err) {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Cannot encode this text');
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput(input);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Base64 Encoder/Decoder</h1>
          <p className="text-slate-600">Encode text to Base64 or decode Base64 to text</p>
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
              Encode to Base64
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Decode from Base64
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string...'}
                className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={swapMode}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Swap input/output"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                </label>
                {output && (
                  <button
                    onClick={copyToClipboard}
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
              onClick={processText}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What is Base64?</h3>
          <p className="text-sm text-blue-700">
            Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.
            It's commonly used to encode data for transmission over media that are designed to deal with text.
            Each Base64 digit represents exactly 6 bits of data.
          </p>
        </div>
      </div>
    </div>
  );
}
