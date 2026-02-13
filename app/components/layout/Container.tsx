import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-[1350px] px-4 w-full bg-white my-4 mb-8 rounded-lg ${className}`}>
      {children}
    </div>
  );
}
