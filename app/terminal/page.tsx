import { Metadata } from 'next';
import Terminal from '../components/pages/Terminal';

export const metadata: Metadata = {
  title: 'Terminal - OpenKai',
  description: 'Interactive web terminal',
};

export default function TerminalPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Terminal />
    </main>
  );
}
