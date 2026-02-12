import { Metadata } from 'next';
import RegexTester from '../components/pages/RegexTester';

export const metadata: Metadata = {
  title: 'Regex Tester - OpenKai',
  description: 'Test and validate regular expressions',
};

export default function RegexTesterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <RegexTester />
    </main>
  );
}
