import { Metadata } from 'next';
import Base64Tool from '../components/pages/Base64Tool';

export const metadata: Metadata = {
  title: 'Base64 Tool - OpenKai',
  description: 'Encode and decode Base64 strings',
};

export default function Base64ToolPage() {
  return (
    <main className="min-h-screen">
      <Base64Tool />
    </main>
  );
}
