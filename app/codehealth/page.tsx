import { Metadata } from 'next';
import WorkspaceLayout from '../components/layout/WorkspaceLayout';
import CodeHealth from '../components/pages/CodeHealth';

export const metadata: Metadata = {
  title: 'Code Health - OpenKai',
  description: 'Analyze and improve your code health',
};

export default function CodeHealthPage() {
  return (
    <WorkspaceLayout 
      title="Code Health" 
      iconKey="codehealth"
      toolType="devtool"
    >
      <CodeHealth />
    </WorkspaceLayout>
  );
}
