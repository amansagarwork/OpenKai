import { Metadata } from 'next';
import MinusURL from '../components/pages/MinusURL';

export const metadata: Metadata = {
  title: 'MinusURL - OpenKai',
  description: 'Shorten long URLs instantly',
};

export default function MinusURLPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MinusURL />
    </main>
  );
}
