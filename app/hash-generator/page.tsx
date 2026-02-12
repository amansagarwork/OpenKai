import { Metadata } from 'next';
import HashGenerator from '../components/pages/HashGenerator';

export const metadata: Metadata = {
  title: 'Hash Generator - OpenKai',
  description: 'Generate MD5, SHA-1, SHA-256 hashes',
};

export default function HashGeneratorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <HashGenerator />
    </main>
  );
}
