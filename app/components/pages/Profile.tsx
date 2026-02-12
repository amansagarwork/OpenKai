'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Edit2, Save, X } from 'lucide-react';
import { getToken, getUsernameFromToken, getEmailFromToken } from '../../lib/auth';

interface ProfileProps {
  // onNavigate: (path: string) => void;
}

export default function Profile() {
  const router = useRouter();
  const token = getToken();
  const username = getUsernameFromToken(token);
  const email = getEmailFromToken(token);

  // Same initials logic as Navbar
  const initials = (username || email || 'U')
    .split(/[@._-]/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(username);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userStats, setUserStats] = useState({
    pastesCreated: 0,
    urlsShortened: 0,
    joinedDate: ''
  });

  useEffect(() => {
    // Fetch user stats from API
    const fetchStats = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/me`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // You can extend this to include actual stats from your backend
          setUserStats({
            pastesCreated: 0,
            urlsShortened: 0,
            joinedDate: data.user?.createdAt || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  const handleSave = async () => {
    if (!editUsername.trim() || editUsername === username) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/update-profile`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: editUsername.trim() })
      });

      if (response.ok) {
        setMessage('Username updated successfully!');
        setIsEditing(false);
        // Refresh the page to get new token with updated username
        window.location.reload();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update username');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditUsername(username);
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-300 mt-1">Manage your account settings</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Avatar & Username Section */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl">
              {initials || 'U'}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none"
                      placeholder="Username"
                      maxLength={50}
                    />
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-300"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">
                    3-50 characters: letters, numbers, underscores, hyphens
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">{username || 'User'}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit username"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {email}
              </p>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{userStats.pastesCreated}</div>
              <div className="text-sm text-slate-600">Pastes Created</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{userStats.urlsShortened}</div>
              <div className="text-sm text-slate-600">URLs Shortened</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-sm text-slate-600">
                {userStats.joinedDate ? new Date(userStats.joinedDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/open-kai/history')}
                className="px-6 py-3 bg-slate-100 text-slate-800 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                View History
              </button>
              <button
                onClick={() => router.push('/open-kai')}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Create Paste
              </button>
              <button
                onClick={() => router.push('/minusurl')}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Shorten URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
