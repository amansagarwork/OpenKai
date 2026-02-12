import { Metadata } from 'next';
import RedirectPage from '../../components/pages/RedirectPage';

export const metadata: Metadata = {
  title: 'Redirecting... - OpenKai',
  description: 'Redirecting to destination',
};

export default function Redirect({ params }: { params: { shortId: string } }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <RedirectPage shortId={params.shortId} />
    </main>
  );
}
