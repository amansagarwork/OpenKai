import { Metadata } from 'next';
import URLEncoder from '../components/pages/URLEncoder';

export const metadata: Metadata = {
  title: 'URL Encoder - OpenKai',
  description: 'Encode and decode URLs',
};

export default function URLEncoderPage() {
  return (
    <main className="min-h-screen">
      <URLEncoder />
    </main>
  );
}
