import { Metadata } from 'next';
import ToolsLanding from './components/pages/ToolsLanding';
import Navbar from './components/layout/Navbar';

export const metadata: Metadata = {
  title: 'OpenKai - Developer Tools',
  description: 'A collection of developer tools including pastebin, URL shortener, and product management',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-10">
      <ToolsLanding />
    </main>
  );
}
