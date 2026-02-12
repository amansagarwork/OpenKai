'use client';

import { useState } from 'react';
import { Copy, Check, Unlock, AlertCircle } from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';

export default function JWTDecoder() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const decodeJWT = () => {
    setError('');
    setHeader('');
    setPayload('');

    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format: should have 3 parts separated by dots');
      }

      const decodeBase64 = (str: string) => {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(str);
        return JSON.parse(decoded);
      };

      const headerObj = decodeBase64(parts[0]);
      const payloadObj = decodeBase64(parts[1]);

      setHeader(JSON.stringify(headerObj, null, 2));
      setPayload(JSON.stringify(payloadObj, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JWT token');
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">JWT Decoder</h1>
          <p className="text-slate-600">Decode and inspect JSON Web Tokens</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-slate-700">
              JWT Token
            </label>
            <button
              onClick={() => setToken(sampleJWT)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="w-full h-24 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
          />

          <button
            onClick={decodeJWT}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Unlock className="w-5 h-5" />
            Decode JWT
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {(header || payload) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Header (Algorithm)</h2>
                {header && (
                  <button
                    onClick={() => handleCopy(header)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <pre className="bg-slate-50 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-slate-700">{header || 'No header data'}</code>
              </pre>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Payload (Claims)</h2>
                {payload && (
                  <button
                    onClick={() => copyToClipboard(payload)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <pre className="bg-slate-50 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-slate-700">{payload || 'No payload data'}</code>
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What is a JWT?</h3>
          <p className="text-sm text-blue-700">
            JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred 
            between two parties. The claims in a JWT are encoded as a JSON object that is used as the 
            payload of a JSON Web Signature (JWS) structure or as the plaintext of a JSON Web Encryption 
            (JWE) structure, enabling the claims to be digitally signed or integrity protected.
          </p>
        </div>
      </div>
    </div>
  );
}
