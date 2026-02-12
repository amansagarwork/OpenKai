import { Metadata } from 'next';
import ColorConverter from '../components/pages/ColorConverter';

export const metadata: Metadata = {
  title: 'Color Converter - OpenKai',
  description: 'Convert between color formats',
};

export default function ColorConverterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ColorConverter />
    </main>
  );
}
