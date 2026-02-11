import { useState } from 'react';
import { Copy, Check, RefreshCw, Shield } from 'lucide-react';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState('');

  const generatePassword = () => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    let validChars = '';
    if (options.uppercase) validChars += chars.uppercase;
    if (options.lowercase) validChars += chars.lowercase;
    if (options.numbers) validChars += chars.numbers;
    if (options.symbols) validChars += chars.symbols;

    if (validChars === '') {
      setPassword('');
      setStrength('');
      return;
    }

    let result = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += validChars[array[i] % validChars.length];
    }
    
    setPassword(result);
    calculateStrength(result);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) setStrength('Weak');
    else if (score <= 4) setStrength('Medium');
    else setStrength('Strong');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'Strong': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Weak': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Password Generator</h1>
          <p className="text-slate-600">Generate secure, random passwords</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Password Length: {length}</label>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-48"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {key === 'uppercase' ? 'Uppercase (A-Z)' : 
                   key === 'lowercase' ? 'Lowercase (a-z)' : 
                   key === 'numbers' ? 'Numbers (0-9)' : 
                   'Symbols (!@#$%)'}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={generatePassword}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Password
          </button>
        </div>

        {password && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Generated Password</span>
                {strength && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStrengthColor()}`}>
                    {strength}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm break-all"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                Use a password manager to securely store your passwords
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
