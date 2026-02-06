import { Send, Download } from 'lucide-react';

interface OpenPasteHubProps {
  onNavigate: (path: string) => void;
}

export default function OpenPasteHub({ onNavigate }: OpenPasteHubProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">OpenPaste</h1>
            <p className="mt-1 text-slate-600">Send or receive text using a short ID</p>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onNavigate('/open-kai/send')}
                className="group relative p-10 sm:p-14 flex flex-col items-center justify-center gap-5 text-slate-900 hover:bg-slate-50 transition-colors border-b sm:border-b-0 sm:border-r border-slate-200"
              >
                <Send className="w-10 h-10 text-slate-700 group-hover:text-slate-900 transition-colors" />
                <div className="text-center">
                  <div className="text-sm tracking-[0.25em] text-slate-600 font-semibold">SEND TEXT</div>
                  <div className="mt-2 text-slate-500 text-sm">Create a paste and share the ID</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/receive-post')}
                className="group relative p-10 sm:p-14 flex flex-col items-center justify-center gap-5 text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-10 h-10 text-slate-700 group-hover:text-slate-900 transition-colors" />
                <div className="text-center">
                  <div className="text-sm tracking-[0.25em] text-slate-600 font-semibold">RECIEVE TEXT</div>
                  <div className="mt-2 text-slate-500 text-sm">Enter an ID to retrieve content</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-slate-500 text-sm">
            OpenPaste is one service inside A Tools.
          </div>
        </div>
      </div>
    </div>
  );
}
