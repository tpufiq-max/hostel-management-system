import React from 'react';

export default function Input({
  label, type = 'text', placeholder, value, onChange, name, id,
  error, required = false, disabled = false, icon, className = '', ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id || name} className="block text-xs font-medium mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2.5 rounded-xl border bg-[var(--bg-primary)] text-sm outline-none transition-all
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-color)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
