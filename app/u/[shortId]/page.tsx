import { Metadata } from 'next';
import { use } from 'react';
import RedirectPage from '../../components/pages/RedirectPage';

export const metadata: Metadata = {
  title: 'Redirecting... - OpenKai',
  description: 'Redirecting to destination',
};

export default function Redirect({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = use(params);
  
  return (
    <main className="min-h-screen">
      <RedirectPage shortId={shortId} />
    </main>
  );
}
