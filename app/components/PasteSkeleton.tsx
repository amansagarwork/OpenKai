'use client';

import { FileText, Image as ImageIcon, File } from 'lucide-react';

interface PasteSkeletonProps {
  type?: 'image' | 'file' | 'text';
}

// Shimmer animation style
const shimmerStyle = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

export function ShimmerBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded ${className}`}
      style={shimmerStyle}
    />
  );
}

export function PasteSkeleton({ type = 'text' }: PasteSkeletonProps) {
  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header Skeleton with shimmer */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded" />
                <div className="space-y-2">
                  <ShimmerBox className="w-48 h-6 bg-white/20" />
                  <ShimmerBox className="w-32 h-4 bg-white/20" />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Type Indicator */}
              <div className="flex items-center gap-2">
                {type === 'image' && <ImageIcon className="w-4 h-4 text-slate-400" />}
                {type === 'file' && <File className="w-4 h-4 text-slate-400" />}
                {type === 'text' && <FileText className="w-4 h-4 text-slate-400" />}
                <ShimmerBox className="w-20 h-4" />
              </div>

              {/* Content Skeleton based on type with shimmer */}
              {type === 'image' && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-center py-16">
                    <ShimmerBox className="w-32 h-32 rounded-lg" />
                  </div>
                </div>
              )}

              {type === 'file' && (
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-4">
                    <ShimmerBox className="w-14 h-14" />
                    <div className="flex-1 space-y-2">
                      <ShimmerBox className="w-40 h-5" />
                      <ShimmerBox className="w-24 h-4" />
                    </div>
                    <ShimmerBox className="w-28 h-10" />
                  </div>
                </div>
              )}

              {type === 'text' && (
                <div className="space-y-3">
                  <ShimmerBox className="w-full h-4" />
                  <ShimmerBox className="w-full h-4" />
                  <ShimmerBox className="w-3/4 h-4" />
                  <ShimmerBox className="w-full h-4" />
                  <ShimmerBox className="w-5/6 h-4" />
                </div>
              )}

              {/* File info skeleton */}
              <div className="flex items-center gap-2 pt-2">
                <ShimmerBox className="w-4 h-4" />
                <ShimmerBox className="w-32 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export function ImageLoading() {
  return (
    <div className="flex items-center justify-center py-12 bg-slate-50 rounded-lg">
      <div className="w-20 h-20 rounded-lg" style={shimmerStyle} />
    </div>
  );
}

export function FileSkeleton() {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded"
          style={shimmerStyle}
        />
        <div className="flex-1 space-y-2">
          <div className="w-48 h-5 rounded" style={shimmerStyle} />
          <div className="w-24 h-4 rounded" style={shimmerStyle} />
        </div>
        <div className="w-28 h-10 rounded-lg" style={shimmerStyle} />
      </div>
    </div>
  );
}
