import React, { forwardRef } from 'react';

/**
 * Button — clean Tailwind-only button.
 *
 * Replaces the previous 480-line JS-injected-CSS implementation with a
 * ~70-line component using composable Tailwind classes. Same public API:
 * variants (primary/secondary/danger/success/ghost/outline), sizes (xs/sm/md/lg),
 * loading, disabled, fullWidth, pill, iconOnly, leftIcon, rightIcon.
 */

const VARIANT = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 focus-visible:ring-blue-500',
  secondary: 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] focus-visible:ring-[var(--text-secondary)]',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 focus-visible:ring-red-500',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus-visible:ring-emerald-500',
  ghost:     'bg-transparent hover:bg-[var(--bg-primary)] text-[var(--text-primary)] focus-visible:ring-[var(--text-secondary)]',
  outline:   'bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 border border-blue-600 focus-visible:ring-blue-500',
};

const SIZE = {
  xs: 'h-7 px-2.5 text-[11px] gap-1.5',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const ICON_ONLY_SIZE = { xs: 'h-7 w-7', sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    pill = false,
    iconOnly = false,
    leftIcon,
    rightIcon,
    type = 'button',
    as: Tag = 'button',
    className = '',
    onClick,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const sizeCls = iconOnly ? `${ICON_ONLY_SIZE[size]} p-0` : SIZE[size];
  const radiusCls = pill ? 'rounded-full' : 'rounded-xl';
  const widthCls = fullWidth ? 'w-full' : '';
  const stateCls = isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-[0.97]';

  const classes = [
    'inline-flex items-center justify-center font-medium whitespace-nowrap',
    'transition-all duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
    sizeCls,
    radiusCls,
    widthCls,
    stateCls,
    VARIANT[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = { xs: 12, sm: 14, md: 16, lg: 18 }[size];

  return (
    <Tag
      ref={ref}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={classes}
      onClick={isDisabled ? undefined : onClick}
      {...rest}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0" style={{ width: iconSize, height: iconSize }}>{leftIcon}</span>}
          {!iconOnly && children}
          {iconOnly && children}
          {rightIcon && <span className="flex-shrink-0" style={{ width: iconSize, height: iconSize }}>{rightIcon}</span>}
        </>
      )}
    </Tag>
  );
});

export default Button;
