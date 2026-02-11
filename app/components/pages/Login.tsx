'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';
import { setToken } from '../../lib/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const submit = async () => {
    setError('');
    setEmailError('');
    setPasswordError('');

    // Client-side validation
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg = data?.error || 'Login failed';
        // Map backend errors to specific fields
        if (errorMsg.includes('email') || errorMsg.includes('account')) {
          setEmailError(errorMsg);
        } else if (errorMsg.includes('password')) {
          setPasswordError(errorMsg);
        } else {
          setError(errorMsg);
        }
        return;
      }

      if (typeof data?.token !== 'string') {
        setError('Invalid server response');
        return;
      }

      setToken(data.token, rememberMe);
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center gap-3">
            <LogIn className="w-6 h-6 text-white" />
            <div>
              <div className="text-white font-bold text-xl">Login</div>
              <div className="text-slate-200 text-sm">Access history and saved pastes</div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="you@company.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all ${
                  emailError 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-slate-300 focus:border-slate-700 focus:ring-slate-200'
                }`}
              />
              {emailError && (
                <p className="mt-1.5 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all ${
                  passwordError 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-slate-300 focus:border-slate-700 focus:ring-slate-200'
                }`}
              />
              {passwordError && (
                <p className="mt-1.5 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                Remember me
              </label>
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
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="text-sm text-slate-600 text-center">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-slate-900 font-semibold hover:underline"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
