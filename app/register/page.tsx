import { Metadata } from 'next';
import Register from '../components/pages/Register';

export const metadata: Metadata = {
  title: 'Register - OpenKai',
  description: 'Create a new OpenKai account',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[900px] mx-auto w-full px-4">
        <Register />
      </div>
    </main>
  );
}
