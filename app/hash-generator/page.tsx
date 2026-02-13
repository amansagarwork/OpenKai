import { Metadata } from 'next';
import HashGenerator from '../components/pages/HashGenerator';

export const metadata: Metadata = {
  title: 'Hash Generator - OpenKai',
  description: 'Generate MD5, SHA-1, SHA-256 hashes',
};

export default function HashGeneratorPage() {
  return (
    <main className="min-h-screen">
      <HashGenerator />
    </main>
  );
}
