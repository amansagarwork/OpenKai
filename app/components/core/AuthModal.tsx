import { useState } from 'react';
import { User, LogIn, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuest: () => void;
  onLogin: () => void;
  feature?: string;
}

export default function AuthModal({ isOpen, onClose, onGuest, onLogin, feature = 'this feature' }: AuthModalProps) {
  const [rememberChoice, setRememberChoice] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">How would you like to continue?</h2>
          <p className="text-slate-600 text-sm">
            To access {feature}, please choose how you want to proceed
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onGuest}
            className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <User className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">Continue as Guest</h3>
              <p className="text-sm text-slate-500">Quick access without account</p>
            </div>
          </button>

          <button
            onClick={onLogin}
            className="w-full p-4 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center group-hover:bg-blue-300 transition-colors">
              <LogIn className="w-6 h-6 text-blue-700" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-blue-800">Login / Register</h3>
              <p className="text-sm text-blue-600">Access all features with account</p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Guest users can view and download content. Login required for history and advanced features.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="remember" className="text-sm text-slate-600">
            Remember my choice
          </label>
        </div>
      </div>
    </div>
  );
}
