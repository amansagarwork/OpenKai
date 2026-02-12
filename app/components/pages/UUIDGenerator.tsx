'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

export default function UUIDGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [format, setFormat] = useState<'standard' | 'uppercase' | 'no-dashes'>('standard');

  const generateUUID = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let uuid = crypto.randomUUID() as string;
      if (format === 'uppercase') {
        uuid = uuid.toUpperCase();
      } else if (format === 'no-dashes') {
        uuid = uuid.replace(/-/g, '');
      }
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  };

  const handleCopy = async (uuid: string) => {
    await copyToClipboard(uuid);
    setCopied(uuid);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    await copyToClipboard(uuids.join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">UUID Generator</h1>
          <p className="text-slate-600">Generate unique identifiers for your applications</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of UUIDs
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="standard">Standard (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)</option>
                <option value="uppercase">Uppercase</option>
                <option value="no-dashes">No Dashes</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateUUID}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate UUID{count > 1 ? 's' : ''}
          </button>
        </div>

        {uuids.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Generated {uuids.length} UUID{uuids.length > 1 ? 's' : ''}
              </h2>
              {uuids.length > 1 && (
                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'all' ? 'Copied!' : 'Copy All'}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <code className="flex-1 font-mono text-sm text-slate-700 break-all">
                    {uuid}
                  </code>
                  <button
                    onClick={() => copyToClipboard(uuid)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy"
                  >
                    {copied === uuid ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What is a UUID?</h3>
          <p className="text-sm text-blue-700">
            A UUID (Universally Unique Identifier) is a 128-bit number used to identify information 
            in computer systems. Version 4 UUIDs are randomly generated and have 122 bits of randomness, 
            making collisions extremely unlikely.
          </p>
        </div>
      </div>
    </div>
  );
}
