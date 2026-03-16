import { Metadata } from 'next';
import WorkspaceLayout from '../components/layout/WorkspaceLayout';
import MinusURL from '../components/pages/MinusURL';

export const metadata: Metadata = {
  title: 'MinusURL - OpenKai',
  description: 'Shorten long URLs instantly',
};

export default function MinusURLPage() {
  return (
    <WorkspaceLayout 
      title="MinusURL" 
      iconKey="minusurl"
      toolType="devtool"
    >
      <MinusURL />
    </WorkspaceLayout>
  );
}
