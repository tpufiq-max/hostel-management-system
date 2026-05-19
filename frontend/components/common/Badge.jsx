import React from 'react';

export default function Badge({ 
  text, 
  variant = 'default',
  size = 'md',
  icon = null,
  animated = false,
  glowing = false
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const animationClass = animated ? 'animate-pulse' : glowing ? 'animate-glow' : '';

  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full font-semibold border-2
      ${variants[variant]} 
      ${sizes[size]}
      ${animationClass}
      transition-all duration-200
    `}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {text}
    </div>
  );
}
