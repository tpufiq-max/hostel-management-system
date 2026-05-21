import React from 'react';

export default function Card({ children, className = '', hoverable = false, style, onClick }) {
  return (
    <div
      className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-sm transition-all duration-200
        ${hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
