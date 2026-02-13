import { Metadata } from 'next';
import ColorConverter from '../components/pages/ColorConverter';

export const metadata: Metadata = {
  title: 'Color Converter - OpenKai',
  description: 'Convert between color formats',
};

export default function ColorConverterPage() {
  return (
    <main className="min-h-screen">
      <ColorConverter />
    </main>
  );
}
