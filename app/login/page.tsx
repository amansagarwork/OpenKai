import { Metadata } from 'next';
import Login from '../components/pages/Login';

export const metadata: Metadata = {
  title: 'Login - OpenKai',
  description: 'Login to access your OpenKai account',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto w-full px-4">
        <Login />
      </div>
    </main>
  );
}
