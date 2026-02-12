import { Metadata } from 'next';
import OpenPasteHub from '../components/pages/OpenPasteHub';

export const metadata: Metadata = {
  title: 'OpenPaste Hub - OpenKai',
  description: 'Share text, images, and files instantly',
};

export default function OpenKaiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <OpenPasteHub />
    </main>
  );
}
