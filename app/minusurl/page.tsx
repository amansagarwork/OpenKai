import { Metadata } from 'next';
import MinusURL from '../components/pages/MinusURL';

export const metadata: Metadata = {
  title: 'MinusURL - OpenKai',
  description: 'Shorten long URLs instantly',
};

export default function MinusURLPage() {
  return (
    <main className="min-h-screen">
      <MinusURL />
    </main>
  );
}
