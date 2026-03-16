import { Metadata } from 'next';
import LayoutWithNav from '../layout-with-nav';
import Register from '../components/pages/Register';

export const metadata: Metadata = {
  title: 'Register - OpenKai',
  description: 'Create a new OpenKai account',
};

export default function RegisterPage() {
  return (
    <LayoutWithNav>
      <div className="max-w-[900px] mx-auto w-full px-4">
        <Register />
      </div>
    </LayoutWithNav>
  );
}
