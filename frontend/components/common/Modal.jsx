import React, { useEffect } from 'react';

/**
 * Modal Component
 * A flexible modal dialog component with customizable size and styling
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when modal should close
 * @param {string} title - Modal title/header text
 * @param {React.ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md' (default), 'lg', 'xl', 'full'
 * @param {boolean} closeButton - Show X button in header (default: true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} rounded-xl bg-[var(--bg-secondary)] shadow-2xl transform transition-all duration-200 animate-slideIn`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {closeButton && (
              <button
                onClick={onClose}
                className="text-3xl text-gray-500 hover:text-gray-900 transition-colors font-light leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
