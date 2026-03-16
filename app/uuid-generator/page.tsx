import { Metadata } from 'next';
import LayoutWithNav from '../layout-with-nav';
import UUIDGenerator from '../components/pages/UUIDGenerator';

export const metadata: Metadata = {
  title: 'UUID Generator - OpenKai',
  description: 'Generate UUIDs for your applications',
};

export default function UUIDGeneratorPage() {
  return (
    <LayoutWithNav>
      <UUIDGenerator />
    </LayoutWithNav>
  );
}
