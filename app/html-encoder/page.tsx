import { Metadata } from 'next';
import HTMLEncoder from '../components/pages/HTMLEncoder';

export const metadata: Metadata = {
  title: 'HTML Encoder - OpenKai',
  description: 'Encode and decode HTML entities',
};

export default function HTMLEncoderPage() {
  return (
    <main className="min-h-screen">
      <HTMLEncoder />
    </main>
  );
}
