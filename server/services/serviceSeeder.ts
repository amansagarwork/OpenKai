import mongoose from 'mongoose';
import { Service } from '../models/Service';

// Predefined services data
const predefinedServices = [
  // Featured Services
  {
    id: 'open-paste',
    name: 'OpenPaste',
    description: 'Share text snippets instantly',
    category: 'paste',
    subcategory: 'text',
    icon: 'FileText',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    href: '/open-kai',
    featured: true,
    tags: ['paste', 'text', 'sharing', 'snippets']
  },
  {
    id: 'minusurl',
    name: 'MinusURL',
    description: 'Shorten long URLs',
    category: 'url',
    subcategory: 'shortener',
    icon: 'Link2',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    href: '/minusurl',
    featured: true,
    tags: ['url', 'shortener', 'link', 'sharing']
  },
  {
    id: 'product-management',
    name: 'Product Management',
    description: 'Jira-style project tracker',
    category: 'productivity',
    subcategory: 'manager',
    icon: 'Target',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    href: '/product-management',
    featured: true,
    tags: ['project', 'tracker', 'jira', 'management', 'sprints']
  },

  // All Tools
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Execute safe commands',
    category: 'development',
    subcategory: 'executor',
    icon: 'Terminal',
    iconBg: 'bg-slate-900',
    iconColor: 'text-white',
    href: '/terminal',
    featured: false,
    tags: ['terminal', 'command', 'shell', 'executor']
  },
  {
    id: 'codehealth',
    name: 'Code Health',
    description: 'Code quality analyzer',
    category: 'development',
    subcategory: 'analyzer',
    icon: 'Code',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    href: '/codehealth',
    featured: false,
    tags: ['code', 'quality', 'analyzer', 'lint']
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique IDs',
    category: 'utility',
    subcategory: 'generator',
    icon: 'Sparkles',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    href: '/uuid-generator',
    featured: false,
    tags: ['uuid', 'generator', 'id', 'unique']
  },
  {
    id: 'base64-tool',
    name: 'Base64 Tool',
    description: 'Encode/Decode Base64',
    category: 'utility',
    subcategory: 'encoder',
    icon: 'Shuffle',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    href: '/base64-tool',
    featured: false,
    tags: ['base64', 'encode', 'decode', 'converter']
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format & Validate JSON',
    category: 'utility',
    subcategory: 'formatter',
    icon: 'FileJson',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    href: '/json-formatter',
    featured: false,
    tags: ['json', 'formatter', 'validator', 'minify']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Secure password creator',
    category: 'security',
    subcategory: 'generator',
    icon: 'Shield',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    href: '/password-generator',
    featured: false,
    tags: ['password', 'generator', 'security', 'random']
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode JSON Web Tokens',
    category: 'security',
    subcategory: 'decoder',
    icon: 'Unlock',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    href: '/jwt-decoder',
    featured: false,
    tags: ['jwt', 'token', 'decoder', 'security']
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'URL encoding tool',
    category: 'utility',
    subcategory: 'encoder',
    icon: 'Globe',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    href: '/url-encoder',
    featured: false,
    tags: ['url', 'encoder', 'encoding', 'parameters']
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'SHA-256, SHA-512 hashes',
    category: 'security',
    subcategory: 'generator',
    icon: 'Hash',
    iconBg: 'bg-lime-100',
    iconColor: 'text-lime-600',
    href: '/hash-generator',
    featured: false,
    tags: ['hash', 'generator', 'sha256', 'sha512', 'cryptographic']
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions',
    category: 'development',
    subcategory: 'validator',
    icon: 'Bug',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    href: '/regex-tester',
    featured: false,
    tags: ['regex', 'regular', 'expression', 'tester', 'validator']
  },
  {
    id: 'html-encoder',
    name: 'HTML Encoder',
    description: 'Encode special characters',
    category: 'utility',
    subcategory: 'encoder',
    icon: 'Code2',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    href: '/html-encoder',
    featured: false,
    tags: ['html', 'encoder', 'entities', 'special', 'characters']
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'HEX ↔ RGB ↔ HSL',
    category: 'utility',
    subcategory: 'converter',
    icon: 'Palette',
    iconBg: 'bg-fuchsia-100',
    iconColor: 'text-fuchsia-600',
    href: '/color-converter',
    featured: false,
    tags: ['color', 'converter', 'hex', 'rgb', 'hsl']
  },
  {
    id: 'csv-to-json',
    name: 'CSV ↔ JSON',
    description: 'Convert data formats',
    category: 'data',
    subcategory: 'converter',
    icon: 'FileSpreadsheet',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    href: '/csv-to-json',
    featured: false,
    tags: ['csv', 'json', 'converter', 'data', 'format']
  },
  {
    id: 'lorem-generator',
    name: 'Lorem Ipsum',
    description: 'Placeholder text generator',
    category: 'utility',
    subcategory: 'generator',
    icon: 'Type',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600',
    href: '/lorem-generator',
    featured: false,
    tags: ['lorem', 'placeholder', 'text', 'generator']
  }
];

// Seed services function
export const seedServices = async () => {
  try {
    console.log('Seeding services...');
    
    // Clear existing services
    await Service.deleteMany({});
    
    // Insert predefined services
    await Service.insertMany(predefinedServices);
    
    console.log(`Seeded ${predefinedServices.length} services successfully`);
  } catch (error) {
    console.error('Failed to seed services:', error);
  }
};

// Get services for frontend
export const getServicesForFrontend = async () => {
  try {
    const services = await Service.find({}).sort({ featured: -1, name: 1 });
    return services;
  } catch (error) {
    console.error('Failed to get services:', error);
    return [];
  }
};
