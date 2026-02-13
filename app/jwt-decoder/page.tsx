import { Metadata } from 'next';
import JWTDecoder from '../components/pages/JWTDecoder';

export const metadata: Metadata = {
  title: 'JWT Decoder - OpenKai',
  description: 'Decode and inspect JWT tokens',
};

export default function JWTDecoderPage() {
  return (
    <main className="min-h-screen">
      <JWTDecoder />
    </main>
  );
}
