'use client';

import * as React from 'react';
import { cn } from '../../app/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative overflow-auto', className)}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(203 213 225) transparent'
      }}
      {...props}
    >
      {children}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background-color: rgb(203 213 225);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background-color: rgb(148 163 184);
        }
      `}</style>
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
