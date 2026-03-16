import { Metadata } from 'next';
import LayoutWithNav from '../layout-with-nav';
import Profile from '../components/pages/Profile';

export const metadata: Metadata = {
  title: 'Profile - OpenKai',
  description: 'Manage your OpenKai profile',
};

export default function ProfilePage() {
  return (
    <LayoutWithNav>
      <Profile />
    </LayoutWithNav>
  );
}
