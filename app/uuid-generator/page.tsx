import { Metadata } from 'next';
import UUIDGenerator from '../components/pages/UUIDGenerator';

export const metadata: Metadata = {
  title: 'UUID Generator - OpenKai',
  description: 'Generate UUIDs for your applications',
};

export default function UUIDGeneratorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <UUIDGenerator />
    </main>
  );
}
