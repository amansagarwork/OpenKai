import { Metadata } from 'next';
import PasteView from "../../../components/pages/PasteView";

export const metadata: Metadata = {
  title: 'View Paste - OpenKai',
  description: 'View shared content',
};

export default function PasteViewPage() {
  return (
    <main className="min-h-screen">
      <PasteView />
    </main>
  );
}
