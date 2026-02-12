'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Type } from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

export default function LoremGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(5);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'paragraphs' | 'sentences'>('paragraphs');

  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generateSentence = () => {
    const length = Math.floor(Math.random() * 8) + 5;
    const sentenceWords = [];
    for (let i = 0; i < length; i++) {
      sentenceWords.push(words[Math.floor(Math.random() * words.length)]);
    }
    return sentenceWords.join(' ') + '.';
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 3) + 3;
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      let sentence = generateSentence();
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      sentences.push(sentence);
    }
    return sentences.join(' ');
  };

  const generate = () => {
    const result = [];
    const count = mode === 'paragraphs' ? paragraphs : sentences;
    
    for (let i = 0; i < count; i++) {
      if (mode === 'paragraphs') {
        result.push(generateParagraph());
      } else {
        let sentence = generateSentence();
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        result.push(sentence);
      }
    }
    
    setOutput(mode === 'paragraphs' ? result.join('\n\n') : result.join(' '));
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Lorem Ipsum Generator</h1>
          <p className="text-slate-600">Generate placeholder text for your designs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setMode('paragraphs')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'paragraphs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Paragraphs
            </button>
            <button
              onClick={() => setMode('sentences')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'sentences'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sentences
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of {mode}: {mode === 'paragraphs' ? paragraphs : sentences}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={mode === 'paragraphs' ? paragraphs : sentences}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                mode === 'paragraphs' ? setParagraphs(val) : setSentences(val);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          <button
            onClick={generate}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Generate
          </button>
        </div>

        {output && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Generated Text
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {output}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
