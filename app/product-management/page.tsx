import { Metadata } from 'next';
import ProductManagement from '../components/ProductManagement';

export const metadata: Metadata = {
  title: 'Product Management - OpenKai',
  description: 'Jira-style project tracking and management',
};

export default function ProductManagementPage() {
  return (
    <main className="min-h-screen">
      <ProductManagement />
    </main>
  );
}
