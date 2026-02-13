import { Metadata } from 'next';
import JSONFormatter from '../components/pages/JSONFormatter';

export const metadata: Metadata = {
  title: 'JSON Formatter - OpenKai',
  description: 'Format and validate JSON data',
};

export default function JSONFormatterPage() {
  return (
    <main className="min-h-screen">
      <JSONFormatter />
    </main>
  );
}
