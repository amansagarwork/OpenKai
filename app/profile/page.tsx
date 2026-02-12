import { Metadata } from 'next';
import Profile from '../components/pages/Profile';

export const metadata: Metadata = {
  title: 'Profile - OpenKai',
  description: 'Manage your OpenKai profile',
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Profile />
    </main>
  );
}
