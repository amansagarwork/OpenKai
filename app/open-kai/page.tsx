import { Metadata } from 'next';
import LayoutWithNav from '../layout-with-nav';
import OpenPasteHub from '../components/pages/OpenPasteHub';

export const metadata: Metadata = {
  title: 'OpenPaste Hub - OpenKai',
  description: 'Share text, images, and files instantly',
};

export default function OpenKaiPage() {
  return (
    <LayoutWithNav>
      <OpenPasteHub />
    </LayoutWithNav>
  );
}
