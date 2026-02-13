import { Metadata } from 'next';
import UUIDGenerator from '../components/pages/UUIDGenerator';

export const metadata: Metadata = {
  title: 'UUID Generator - OpenKai',
  description: 'Generate UUIDs for your applications',
};

export default function UUIDGeneratorPage() {
  return (
    <main className="min-h-screen">
      <UUIDGenerator />
    </main>
  );
}
