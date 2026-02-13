import { Metadata } from 'next';
import ReceivePost from '../components/pages/ReceivePost';

export const metadata: Metadata = {
  title: 'Receive Post - OpenKai',
  description: 'Retrieve shared content by ID',
};

export default function ReceivePostPage() {
  return (
    <main className="min-h-screen">
      <ReceivePost />
    </main>
  );
}
