import React from 'react';

export default function Alert({ 
  title, 
  message, 
  type = 'info',
  onClose,
  dismissible = true,
  icon = null
}) {
  const typeConfig = {
    info: { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'ℹ️', textColor: 'text-blue-900' },
    success: { bg: 'bg-green-50', border: 'border-green-300', icon: '✓', textColor: 'text-green-900' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', icon: '⚠️', textColor: 'text-yellow-900' },
    error: { bg: 'bg-red-50', border: 'border-red-300', icon: '✕', textColor: 'text-red-900' },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-lg p-4 flex items-start gap-4 ${config.textColor}`}>
      <div className="text-2xl flex-shrink-0">{icon || config.icon}</div>
      <div className="flex-1">
        {title && <p className="font-bold text-lg">{title}</p>}
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      {dismissible && (
        <button
          onClick={onClose}
          className="text-2xl flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
}
