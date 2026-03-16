import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export default function Container({ children, className = '', fullWidth = false }: ContainerProps) {
  return (
    <div className={`mx-auto ${fullWidth ? 'w-full' : 'max-w-[1400px] px-4 w-full bg-white dark:bg-slate-950 my-4 mb-8 rounded-lg dark:text-slate-100'} ${className}`}>
      {children}
    </div>
  );
}
