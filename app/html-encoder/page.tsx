import { Metadata } from 'next';
import HTMLEncoder from '../components/pages/HTMLEncoder';

export const metadata: Metadata = {
  title: 'HTML Encoder - OpenKai',
  description: 'Encode and decode HTML entities',
};

export default function HTMLEncoderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <HTMLEncoder />
    </main>
  );
}
