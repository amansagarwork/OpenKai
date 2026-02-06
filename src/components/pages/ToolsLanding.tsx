import { FileText, Link2, Terminal, Code } from 'lucide-react';

interface ToolsLandingProps {
  onNavigate: (path: string) => void;
}

export default function ToolsLanding({ onNavigate }: ToolsLandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Internal Tools</h1>
          <p className="mt-2 text-slate-600">
            A simple toolbox for your team. Choose a service to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => onNavigate('/open-kai')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">OpenPaste</div>
                <div className="text-sm text-slate-600">Share text snippets instantly</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Create a paste, get a short URL, and share it with your team.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/minusurl')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Link2 className="w-7 h-7 text-violet-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">MinusURL</div>
                <div className="text-sm text-slate-600">Shorten long URLs</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Convert long URLs into short, shareable links.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/terminal')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 rounded-xl">
                <Terminal className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Terminal</div>
                <div className="text-sm text-slate-600">Execute safe commands</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Run terminal commands with command logging and history.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/code-health')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Code className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Code Health</div>
                <div className="text-sm text-slate-600">Code quality analyzer</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Analyze code quality and find lint issues.
            </div>
          </button>

          <div className="bg-white/40 rounded-2xl border border-dashed border-slate-300 p-6">
            <div className="text-slate-700 font-semibold">More tools coming soon</div>
            <div className="mt-1 text-sm text-slate-600">
              This space will include additional internal services.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
