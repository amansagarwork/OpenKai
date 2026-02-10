import { FileText, Link2, Terminal, Code, Sparkles, Shuffle, FileJson, Shield, Unlock, Globe, Hash, Bug, Code2, Palette, FileSpreadsheet, Type } from 'lucide-react';

interface ToolsLandingProps {
  onNavigate: (path: string) => void;
  onAuthNavigate?: (path: string, feature: string) => void;
}

export default function ToolsLanding({ onNavigate, onAuthNavigate }: ToolsLandingProps) {
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
            onClick={() => onAuthNavigate ? onAuthNavigate('/open-kai', 'OpenPaste') : onNavigate('/open-kai')}
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

          <button
            type="button"
            onClick={() => onNavigate('/uuid-generator')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Sparkles className="w-7 h-7 text-pink-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">UUID Generator</div>
                <div className="text-sm text-slate-600">Generate unique IDs</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Generate UUID v4 identifiers for your applications.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/base64')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Shuffle className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Base64 Tool</div>
                <div className="text-sm text-slate-600">Encode/Decode Base64</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Encode text to Base64 or decode Base64 to text instantly.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/json')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FileJson className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">JSON Formatter</div>
                <div className="text-sm text-slate-600">Format & Validate JSON</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Format, validate, and minify JSON data with ease.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/password')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Shield className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Password Generator</div>
                <div className="text-sm text-slate-600">Secure password creator</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Generate strong, secure passwords with custom options.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/jwt')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Unlock className="w-7 h-7 text-cyan-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">JWT Decoder</div>
                <div className="text-sm text-slate-600">Decode JSON Web Tokens</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600">
              Inspect and decode JWT tokens to view header and payload claims.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/url')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Globe className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">URL Encoder</div>
                <div className="text-sm text-slate-600">URL encoding tool</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Encode and decode URLs and URL parameters.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/hash')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-lime-100 rounded-xl">
                <Hash className="w-7 h-7 text-lime-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Hash Generator</div>
                <div className="text-sm text-slate-600">SHA-256, SHA-512 hashes</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Generate cryptographic hashes for any text.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/regex')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Bug className="w-7 h-7 text-violet-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Regex Tester</div>
                <div className="text-sm text-slate-600">Test regular expressions</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Test and validate regular expressions with sample data.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/html')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Code2 className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">HTML Encoder</div>
                <div className="text-sm text-slate-600">Encode special characters</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Convert special characters to HTML entities.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/color')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-fuchsia-100 rounded-xl">
                <Palette className="w-7 h-7 text-fuchsia-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Color Converter</div>
                <div className="text-sm text-slate-600">HEX ↔ RGB ↔ HSL</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Convert between color formats with live preview.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/csv')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FileSpreadsheet className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">CSV ↔ JSON</div>
                <div className="text-sm text-slate-600">Convert data formats</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Convert between CSV and JSON formats.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/lorem')}
            className="text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-stone-100 rounded-xl">
                <Type className="w-7 h-7 text-stone-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">Lorem Ipsum</div>
                <div className="text-sm text-slate-600">Placeholder text generator</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              Generate placeholder text for designs.
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
