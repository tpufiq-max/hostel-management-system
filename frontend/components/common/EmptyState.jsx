import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon, title = 'No data found', description, action, actionLabel }) {
  const Icon = icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon size={48} className="text-[var(--text-secondary)] opacity-40 mb-4" />
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--text-secondary)] max-w-sm">{description}</p>}
      {action && (
        <button onClick={action} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          {actionLabel || 'Take Action'}
        </button>
      )}
    </div>
  );
}
