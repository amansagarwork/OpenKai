import { Metadata } from 'next';
import PasswordGenerator from '../components/pages/PasswordGenerator';

export const metadata: Metadata = {
  title: 'Password Generator - OpenKai',
  description: 'Generate secure passwords',
};

export default function PasswordGeneratorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PasswordGenerator />
    </main>
  );
}
