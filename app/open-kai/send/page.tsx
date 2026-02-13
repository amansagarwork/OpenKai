import { Metadata } from 'next';
import HomePage from '../../components/pages/HomePage';

export const metadata: Metadata = {
  title: 'Send - OpenKai',
  description: 'Create and share a new paste',
};

export default function SendPage() {
  return (
    <main className="min-h-screen">
      <HomePage />
    </main>
  );
}
