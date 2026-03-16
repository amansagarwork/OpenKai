import { Metadata } from 'next';
import LayoutWithNav from '../layout-with-nav';
import Login from '../components/pages/Login';

export const metadata: Metadata = {
  title: 'Login - OpenKai',
  description: 'Login to access your OpenKai account',
};

export default function LoginPage() {
  return (
    <LayoutWithNav>
      <div className="max-w-[900px] mx-auto w-full px-4">
        <Login />
      </div>
    </LayoutWithNav>
  );
}
