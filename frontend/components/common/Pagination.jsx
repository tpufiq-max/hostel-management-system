import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-[var(--border-color)] disabled:opacity-30 hover:bg-[var(--bg-primary)] transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'border border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-[var(--border-color)] disabled:opacity-30 hover:bg-[var(--bg-primary)] transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
