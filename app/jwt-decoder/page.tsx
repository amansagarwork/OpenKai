import { Metadata } from 'next';
import LayoutWithNav from '../layout-with-nav';
import JWTDecoder from '../components/pages/JWTDecoder';

export const metadata: Metadata = {
  title: 'JWT Decoder - OpenKai',
  description: 'Decode and inspect JWT tokens',
};

export default function JWTDecoderPage() {
  return (
    <LayoutWithNav>
      <JWTDecoder />
    </LayoutWithNav>
  );
}
