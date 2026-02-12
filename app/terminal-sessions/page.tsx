import { Metadata } from 'next';
import TerminalSessions from '../components/pages/TerminalSessions';

export const metadata: Metadata = {
  title: 'Terminal Sessions - OpenKai',
  description: 'Manage your terminal sessions',
};

export default function TerminalSessionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TerminalSessions />
    </main>
  );
}
