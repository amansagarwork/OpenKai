import { Metadata } from 'next';
import CodeHealth from '../components/pages/CodeHealth';

export const metadata: Metadata = {
  title: 'Code Health - OpenKai',
  description: 'Analyze and improve your code health',
};

export default function CodeHealthPage() {
  return (
    <main className="min-h-screen">
      <CodeHealth />
    </main>
  );
}
