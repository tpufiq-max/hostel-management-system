import React, { forwardRef } from 'react';

/**
 * Card — clean composable container.
 *
 * Replaces the previous JS-injected-CSS implementation (520 LOC) with a
 * pure Tailwind component (~80 LOC). Same public API kept for backward
 * compatibility: `<Card>`, `<Card.Header>`, `<Card.Body>`, `<Card.Footer>`,
 * `<Card.Badge>`, `<Card.Stat>`, `<Card.Divider>`, `<Card.Media>`.
 */

const VARIANT = {
  default: 'bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm',
  raised:  'bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-md',
  flat:    'bg-[var(--bg-primary)]',
  outline: 'bg-transparent border-2 border-[var(--border-color)]',
  ghost:   'bg-transparent',
};

const ACCENT = {
  primary: 'border-l-4 border-l-blue-500',
  danger:  'border-l-4 border-l-red-500',
  success: 'border-l-4 border-l-emerald-500',
  warning: 'border-l-4 border-l-amber-500',
  info:    'border-l-4 border-l-sky-500',
};

const Card = forwardRef(function Card(
  {
    children,
    variant = 'default',
    accent,
    hoverable = false,
    clickable = false,
    loading = false,
    className = '',
    onClick,
    ...rest
  },
  ref,
) {
  const base = 'rounded-2xl overflow-hidden transition-all duration-200';
  const interactive = hoverable || clickable;
  const interactiveCls = interactive ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' : '';
  const loadingCls = loading ? 'animate-pulse' : '';
  const classes = [base, VARIANT[variant], accent && ACCENT[accent], interactiveCls, loadingCls, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable && onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
      {...rest}
    >
      {children}
    </div>
  );
});

Card.Header = function CardHeader({ icon, iconColor = 'primary', title, subtitle, actions, divider, className = '', children }) {
  const iconBg = {
    primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    danger:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    info:    'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  }[iconColor];

  return (
    <div className={`flex items-start justify-between gap-3 p-4 sm:p-5 ${divider ? 'border-b border-[var(--border-color)]' : ''} ${className}`}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon && (
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title && <h3 className="text-sm font-semibold truncate">{title}</h3>}
          {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{subtitle}</p>}
          {children}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children, padding = 'default', className = '' }) {
  const pad = padding === 'compact' ? 'p-3' : padding === 'flush' ? 'p-0' : 'p-4 sm:p-5';
  return <div className={`${pad} ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, align = 'end', className = '' }) {
  const justify = { start: 'justify-start', end: 'justify-end', between: 'justify-between', center: 'justify-center' }[align];
  return (
    <div className={`flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/50 ${justify} ${className}`}>
      {children}
    </div>
  );
};

Card.Divider = function CardDivider({ className = '' }) {
  return <hr className={`border-t border-[var(--border-color)] ${className}`} />;
};

Card.Badge = function CardBadge({ children, color = 'neutral', dot, className = '' }) {
  const styles = {
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    danger:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    info:    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    neutral: 'bg-[var(--bg-primary)] text-[var(--text-secondary)]',
  }[color];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

Card.Stat = function CardStat({ value, label, trend, trendLabel, className = '' }) {
  const trendCls = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-[var(--text-secondary)]';
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-secondary)]">{label}</span>
      <span className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</span>
      {trend !== undefined && (
        <span className={`text-xs font-semibold ${trendCls}`}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '·'} {Math.abs(trend)}%
          {trendLabel && <span className="text-[var(--text-secondary)] font-normal ml-1">{trendLabel}</span>}
        </span>
      )}
    </div>
  );
};

Card.Media = function CardMedia({ src, alt = '', height = 140, color = 'rgb(59,130,246,0.1)', children, className = '' }) {
  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height, background: !src ? color : undefined }}>
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : children}
    </div>
  );
};

export default Card;
