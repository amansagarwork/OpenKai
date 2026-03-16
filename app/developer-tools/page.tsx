import { Metadata } from 'next';
import ToolsLanding from '../components/pages/ToolsLanding';

export const metadata: Metadata = {
  title: 'Developer Tools - OpenKai',
  description: '17+ developer tools including code health, pastebin, URL shortener, and more',
};

export default function DeveloperTools() {
  return <ToolsLanding />;
}
