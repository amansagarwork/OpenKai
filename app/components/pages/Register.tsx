'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { setToken } from '../../lib/auth';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');

    if (!email.trim() || !password || !username.trim()) {
      setError('Email, username, and password are required');
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username.trim())) {
      setError('Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/register`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), username: username.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Registration failed');
      }

      if (typeof data?.token !== 'string') {
        throw new Error('Invalid server response');
      }

      setToken(data.token);
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-white" />
            <div>
              <div className="text-white font-bold text-xl">Register</div>
              <div className="text-slate-200 text-sm">Create an account to save history</div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username123"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">3-50 characters: letters, numbers, underscores, hyphens</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>

            <div className="text-sm text-slate-600 text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-slate-900 font-semibold hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
