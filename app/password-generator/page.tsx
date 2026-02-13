import { Metadata } from 'next';
import PasswordGenerator from '../components/pages/PasswordGenerator';

export const metadata: Metadata = {
  title: 'Password Generator - OpenKai',
  description: 'Generate secure passwords',
};

export default function PasswordGeneratorPage() {
  return (
    <main className="min-h-screen">
      <PasswordGenerator />
    </main>
  );
}
