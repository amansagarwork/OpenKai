import { Metadata } from 'next';
import Profile from '../components/pages/Profile';

export const metadata: Metadata = {
  title: 'Profile - OpenKai',
  description: 'Manage your OpenKai profile',
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen">
      <Profile />
    </main>
  );
}
