import { Metadata } from 'next';
import LoremGenerator from '../components/pages/LoremGenerator';

export const metadata: Metadata = {
  title: 'Lorem Generator - OpenKai',
  description: 'Generate Lorem Ipsum placeholder text',
};

export default function LoremGeneratorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LoremGenerator />
    </main>
  );
}
