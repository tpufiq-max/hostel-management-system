import React from 'react';

export default function LoadingSkeleton({ count = 1, type = 'card' }) {
  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-6 rounded-xl bg-gray-200 animate-pulse border-2 border-gray-300">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${80 + Math.random() * 20}%` }}></div>
        ))}
      </div>
    );
  }

  return null;
}
