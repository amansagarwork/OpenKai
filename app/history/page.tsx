import { Metadata } from 'next';
import PasteHistory from '../components/pages/PasteHistory';

export const metadata: Metadata = {
  title: 'History - OpenKai',
  description: 'View your paste and URL history',
};

export default function HistoryPage() {
  return (
    <main className="min-h-screen">
      <PasteHistory />
    </main>
  );
}
