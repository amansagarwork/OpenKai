import { Metadata } from 'next';
import LayoutWithNav from '../layout-with-nav';
import Terminal from '../components/pages/Terminal';

export const metadata: Metadata = {
  title: 'Terminal - OpenKai',
  description: 'Interactive web terminal',
};

export default function TerminalPage() {
  return (
    <LayoutWithNav>
      <Terminal />
    </LayoutWithNav>
  );
}
