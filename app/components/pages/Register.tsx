'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { setToken } from '../../lib/auth';
import { showToast } from "../../lib/toast";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
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

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username.trim())) {
      return 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const submit = async () => {
    setEmailError('');
    setUsernameError('');
    setPasswordError('');

    // Client-side validation
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
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
        showToast.error(data?.error || 'Registration failed');
        return;
      }

      if (typeof data?.token !== 'string') {
        showToast.error('Invalid server response');
        return;
      }

      setToken(data.token);
      showToast.success('Registration successful!');
      router.push('/');
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 pt-16">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-white" />
            <div>
              <div className="text-white font-bold text-lg">Register</div>
              <div className="text-slate-200 text-xs">Create an account to save history</div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Username</label>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                }}
                placeholder="username123"
                className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 outline-none transition-all text-sm ${
                  usernameError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-300 focus:border-slate-700 focus:ring-slate-200'
                }`}
              />
              {usernameError && (
                <p className="mt-1 text-xs text-red-600">{usernameError}</p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">3-50 characters: letters, numbers, underscores, hyphens</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="you@company.com"
                className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 outline-none transition-all text-sm ${
                  emailError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-300 focus:border-slate-700 focus:ring-slate-200'
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                type="password"
                placeholder="At least 6 characters"
                className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 outline-none transition-all text-sm ${
                  passwordError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-300 focus:border-slate-700 focus:ring-slate-200'
                }`}
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>

            <div className="text-xs text-slate-600 text-center">
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
