import { Metadata } from 'next';
import JWTDecoder from '../components/pages/JWTDecoder';

export const metadata: Metadata = {
  title: 'JWT Decoder - OpenKai',
  description: 'Decode and inspect JWT tokens',
};

export default function JWTDecoderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <JWTDecoder />
    </main>
  );
}
