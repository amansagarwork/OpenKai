import { Metadata } from 'next';
import LoremGenerator from '../components/pages/LoremGenerator';

export const metadata: Metadata = {
  title: 'Lorem Generator - OpenKai',
  description: 'Generate Lorem Ipsum placeholder text',
};

export default function LoremGeneratorPage() {
  return (
    <main className="min-h-screen">
      <LoremGenerator />
    </main>
  );
}
