import { Metadata } from 'next';
import CSVToJSON from '../components/pages/CSVToJSON';

export const metadata: Metadata = {
  title: 'CSV to JSON - OpenKai',
  description: 'Convert CSV data to JSON format',
};

export default function CSVToJSONPage() {
  return (
    <main className="min-h-screen">
      <CSVToJSON />
    </main>
  );
}
