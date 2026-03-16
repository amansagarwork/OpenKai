'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Calendar, Edit2, Save, X, Settings, Heart, 
  Trash2, LogOut, ChevronRight, Bell, Moon, Shield, 
  FileText, Link2, AlertTriangle
} from 'lucide-react';
import { getToken, getUsernameFromToken, getEmailFromToken, clearToken } from '../../lib/auth';
import { showToast } from "../../lib/toast";

interface UserSettings {
  emailNotifications: boolean;
  darkMode: boolean;
  twoFactorAuth: boolean;
}

interface FavoriteItem {
  id: string;
  type: 'paste' | 'url';
  title: string;
  slug: string;
  createdAt: string;
}

export default function Profile() {
  const router = useRouter();
  const token = getToken();
  const [displayUsername, setDisplayUsername] = useState(getUsernameFromToken(token));
  const [displayEmail, setDisplayEmail] = useState(getEmailFromToken(token));
  const username = displayUsername;
  const email = displayEmail;

  const [initials, setInitials] = useState('U');
  const [mounted, setMounted] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username.trim())) {
      return 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens';
    }
    return '';
  };

  const [userStats, setUserStats] = useState({
    pastesCreated: 0,
    urlsShortened: 0,
    favoritesCount: 0,
    joinedDate: ''
  });

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setMounted(true);
    // Set editUsername only after mounting to prevent hydration mismatch
    setEditUsername(username || '');
    // Calculate initials client-side only to avoid hydration mismatch
    const calculatedInitials = (username || email || 'U')
      .split(/[@._-]/g)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
    setInitials(calculatedInitials);
  }, [username, email]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/me`;
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserStats({
            pastesCreated: data.stats?.pastesCreated || 0,
            urlsShortened: data.stats?.urlsShortened || 0,
            favoritesCount: data.stats?.favoritesCount || 0,
            joinedDate: data.user?.createdAt || ''
          });
          setSettings(data.settings || settings);
          setFavorites(data.favorites || []);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (token) fetchData();
  }, [token]);

  const handleSaveUsername = async () => {
    setUsernameError('');

    // Client-side validation
    const usernameValidation = validateUsername(editUsername);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      return;
    }

    if (mounted && editUsername === username) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
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
        const data = await response.json();
        // Update token with new username
        if (data.token) {
          const storage = localStorage.getItem('openpaste_token') ? localStorage : sessionStorage;
          storage.setItem('openpaste_token', data.token);
          // Update displayed username immediately
          setDisplayUsername(data.user.username);
          setDisplayEmail(data.user.email);
        }
        showToast.success('Username updated successfully!');
        setIsEditing(false);
      } else {
        const data = await response.json();
        showToast.error(data.error || 'Failed to update username');
      }
    } catch (error) {
      showToast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/settings`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        showToast.success('Settings saved successfully!');
      } else {
        showToast.error('Failed to save settings');
      }
    } catch (error) {
      showToast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast.error('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/delete-account`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showToast.success('Account deleted successfully');
        clearToken();
        router.push('/');
      } else {
        showToast.error('Failed to delete account');
      }
    } catch (error) {
      showToast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/auth/favorites/${id}`;
      await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavorites(favorites.filter(f => f.id !== id));
      setUserStats({ ...userStats, favoritesCount: userStats.favoritesCount - 1 });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
          {initials || 'U'}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => {
                    setEditUsername(e.target.value);
                    setUsernameError('');
                  }}
                  className={`flex-1 px-3 py-1.5 border-2 rounded-lg focus:ring-2 outline-none text-sm ${
                    usernameError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-slate-700 focus:ring-slate-200'
                  }`}
                  maxLength={50}
                />
                {usernameError && (
                  <p className="mt-1 text-xs text-red-600">{usernameError}</p>
                )}
                <button onClick={handleSaveUsername} disabled={loading} className="p-1.5 bg-green-600 text-white rounded-lg">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => { setIsEditing(false); setUsernameError(''); }} className="p-1.5 bg-slate-200 text-slate-700 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {mounted ? (username || 'User') : 'User'}
              </h2>
              <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-slate-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5" />
            {mounted ? email : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-lg font-bold text-slate-900">{userStats.pastesCreated}</div>
          <div className="text-xs text-slate-600">Pastes</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-lg font-bold text-slate-900">{userStats.urlsShortened}</div>
          <div className="text-xs text-slate-600">Short URLs</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-lg font-bold text-slate-900">{userStats.favoritesCount}</div>
          <div className="text-xs text-slate-600">Favorites</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-lg font-bold text-slate-900">
            {userStats.joinedDate ? new Date(userStats.joinedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
          </div>
          <div className="text-xs text-slate-600">Joined</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => router.push('/open-kai')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Create Paste
        </button>
        <button onClick={() => router.push('/minusurl')} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
          Shorten URL
        </button>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Your Favorites</h3>
        <span className="text-xs text-slate-500">{favorites.length} items</span>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No favorites yet</p>
          <p className="text-xs mt-1">Star items to save them here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:bg-slate-100 transition-colors">
              <div className="p-2 bg-white rounded-lg">
                {item.type === 'paste' ? <FileText className="w-4 h-4 text-blue-600" /> : <Link2 className="w-4 h-4 text-violet-600" />}
              </div>
              <Link 
                href={`/${item.type === 'paste' ? 'open-kai' : 'minusurl'}`}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <p className="font-medium text-slate-900 text-sm truncate hover:text-slate-700 transition-colors">{item.title}</p>
                <p className="text-xs text-slate-500">{item.type === 'paste' ? 'Paste' : 'Short URL'} • {new Date(item.createdAt).toLocaleDateString()}</p>
              </Link>
              <button 
                onClick={() => handleRemoveFavorite(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                title="Remove from favorites"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Preferences
        </h3>
        
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">Email Notifications</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="w-4 h-4 rounded border-slate-300"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">Dark Mode</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.darkMode}
              onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
              className="w-4 h-4 rounded border-slate-300"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">Two-Factor Auth</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.twoFactorAuth}
              onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
              className="w-4 h-4 rounded border-slate-300"
            />
          </label>
        </div>
        
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="font-semibold text-red-600 text-sm flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-red-800 font-medium">This action cannot be undone!</p>
            <p className="text-xs text-red-600">Type DELETE to confirm account deletion:</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm"
              placeholder="Type DELETE"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmText !== 'DELETE'}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-slate-300"
              >
                {loading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              <button 
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Profile</h1>
              <p className="text-slate-300 text-sm mt-0.5">Manage your account</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4 mx-auto mb-1" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'favorites' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Heart className="w-4 h-4 mx-auto mb-1" />
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4 mx-auto mb-1" />
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'favorites' && renderFavorites()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}
