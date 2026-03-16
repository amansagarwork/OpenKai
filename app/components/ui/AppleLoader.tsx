'use client';

import { motion } from 'framer-motion';

interface AppleLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'slate' | 'white' | 'orange';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-5 h-5', dot: 'w-1 h-1' },
  md: { container: 'w-8 h-8', dot: 'w-1.5 h-1.5' },
  lg: { container: 'w-12 h-12', dot: 'w-2 h-2' },
  xl: { container: 'w-16 h-16', dot: 'w-2.5 h-2.5' },
};

const colorMap = {
  slate: 'bg-slate-400',
  white: 'bg-white',
  orange: 'bg-orange-500',
};

export function AppleLoader({ size = 'md', color = 'slate', className = '' }: AppleLoaderProps) {
  const { container, dot } = sizeMap[size];
  const dotColor = colorMap[color];

  return (
    <div className={`${container} flex items-center justify-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`${dot} ${dotColor} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

interface PageLoaderProps {
  text?: string;
  color?: 'slate' | 'white' | 'orange';
}

export function PageLoader({ text = 'Loading...', color = 'slate' }: PageLoaderProps) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center gap-4">
      <AppleLoader size="lg" color={color} />
      <p className="text-sm text-slate-400 font-medium">{text}</p>
    </div>
  );
}

interface FullPageLoaderProps {
  text?: string;
  color?: 'slate' | 'white' | 'orange';
}

export function FullPageLoader({ text = 'Loading...', color = 'white' }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 px-8 py-6 flex flex-col items-center gap-3">
        <AppleLoader size="lg" color="orange" />
        <p className="text-sm text-slate-500 font-medium">{text}</p>
      </div>
    </div>
  );
}

interface ButtonLoaderProps {
  size?: 'sm' | 'md';
  color?: 'slate' | 'white' | 'orange';
}

export function ButtonLoader({ size = 'sm', color = 'white' }: ButtonLoaderProps) {
  return <AppleLoader size={size} color={color} />;
}

export default AppleLoader;
