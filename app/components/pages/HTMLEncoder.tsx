'use client';

import { useState } from 'react';
import { Copy, Check, Code2, ArrowRightLeft } from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

export default function HTMLEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const encodeHTML = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const decodeHTML = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const processText = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeHTML(input));
      } else {
        setOutput(decodeHTML(input));
      }
    } catch (err) {
      setOutput('Error: Invalid HTML entities');
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
  };

  const sampleText = '<div class="example">Hello & "Welcome"</div>';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HTML Entity Encoder/Decoder</h1>
          <p className="text-slate-600">Convert special characters to and from HTML entities</p>
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
              Encode to HTML Entities
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Decode from HTML
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              {mode === 'encode' ? 'Text to Encode' : 'HTML to Decode'}
            </label>
            <button
              onClick={() => setInput(sampleText)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Load Sample
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text with special characters...' : 'Enter HTML entities...'}
            className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
          />

          <div className="flex justify-center my-4">
            <button
              onClick={swapMode}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

          <button
            onClick={processText}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Code2 className="w-5 h-5" />
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-medium text-indigo-900 mb-2">Common HTML Entities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div className="bg-white rounded p-2"><code>&amp;amp;</code> = &</div>
            <div className="bg-white rounded p-2"><code>&amp;lt;</code> = &lt;</div>
            <div className="bg-white rounded p-2"><code>&amp;gt;</code> = &gt;</div>
            <div className="bg-white rounded p-2"><code>&amp;quot;</code> = "</div>
          </div>
        </div>
      </div>
    </div>
  );
}
