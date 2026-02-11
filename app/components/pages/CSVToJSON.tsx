import { useState } from 'react';
import { Copy, Check, FileSpreadsheet, ArrowRightLeft } from 'lucide-react';

export default function CSVToJSON() {
  const [csvInput, setCsvInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [mode, setMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      result.push(obj);
    }
    
    return result;
  };

  const convertToCSV = (jsonArray: any[]) => {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) return '';
    
    const headers = Object.keys(jsonArray[0]);
    const csvLines = [headers.join(',')];
    
    jsonArray.forEach(obj => {
      const values = headers.map(header => {
        const value = obj[header]?.toString() || '';
        return value.includes(',') ? `"${value}"` : value;
      });
      csvLines.push(values.join(','));
    });
    
    return csvLines.join('\n');
  };

  const convert = () => {
    setError('');
    try {
      if (mode === 'csv-to-json') {
        const parsed = parseCSV(csvInput);
        setJsonOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(csvInput);
        if (!Array.isArray(parsed)) {
          throw new Error('JSON must be an array of objects');
        }
        setJsonOutput(convertToCSV(parsed));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      setJsonOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleCSV = `name,age,email
John Doe,30,john@example.com
Jane Smith,25,jane@example.com
Bob Johnson,35,bob@example.com`;

  const sampleJSON = `[
  {"name": "John Doe", "age": "30", "email": "john@example.com"},
  {"name": "Jane Smith", "age": "25", "email": "jane@example.com"}
]`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">CSV ↔ JSON Converter</h1>
          <p className="text-slate-600">Convert between CSV and JSON formats</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setMode('csv-to-json')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              mode === 'csv-to-json'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            CSV to JSON
          </button>
          <button
            onClick={() => setMode('json-to-csv')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              mode === 'json-to-csv'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            JSON to CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="font-medium text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                {mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
              </label>
              <button
                onClick={() => setCsvInput(mode === 'csv-to-json' ? sampleCSV : sampleJSON)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={mode === 'csv-to-json' ? 'name,age\nJohn,30\nJane,25' : '[{"name":"John","age":30}]'}
              className="w-full h-80 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="font-medium text-slate-800">
                {mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
              </label>
              {jsonOutput && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <textarea
              value={jsonOutput}
              readOnly
              placeholder={`${mode === 'csv-to-json' ? '[\n  {"name": "John"...\n]' : 'name,age\nJohn,30\n...'}`}
              className="w-full h-80 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 resize-none font-mono text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={convert}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <ArrowRightLeft className="w-5 h-5" />
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}
