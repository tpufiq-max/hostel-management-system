// src/components/common/Card.jsx
// ─────────────────────────────────────────────────────────────
//  Hostel Management System — Card Component System
//
//  Exports:
//    Card            → base container (variants: default | flat | raised | outline | ghost)
//    Card.Header     → top section with title, subtitle, icon, actions
//    Card.Body       → scrollable / padded content area
//    Card.Footer     → bottom actions row
//    Card.Divider    → horizontal rule between sections
//    Card.Badge      → status pill inside header
//    Card.Stat       → metric display (number + label + trend)
//    Card.Media      → full-bleed image / colour banner at top
// ─────────────────────────────────────────────────────────────

import React, { forwardRef } from "react";

// ─────────────────────────────────────────────────────────────
// 1. Design tokens & global CSS (injected once)
// ─────────────────────────────────────────────────────────────
const CARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --hms-c-primary:        #0f766e;
    --hms-c-primary-light:  #ccfbf1;
    --hms-c-danger:         #dc2626;
    --hms-c-danger-light:   #fee2e2;
    --hms-c-success:        #059669;
    --hms-c-success-light:  #d1fae5;
    --hms-c-warning:        #d97706;
    --hms-c-warning-light:  #fef3c7;
    --hms-c-info:           #2563eb;
    --hms-c-info-light:     #dbeafe;

    --hms-card-bg:          #ffffff;
    --hms-card-bg-2:        #f8fafc;
    --hms-card-bg-3:        #f1f5f9;
    --hms-card-border:      rgba(0,0,0,0.08);
    --hms-card-border-md:   rgba(0,0,0,0.13);
    --hms-card-shadow-sm:   0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --hms-card-shadow-md:   0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
    --hms-card-shadow-lg:   0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
    --hms-card-radius:      14px;
    --hms-card-radius-sm:   10px;
    --hms-card-pad:         20px;
    --hms-card-pad-sm:      14px;
    --hms-text-1:           #0f172a;
    --hms-text-2:           #475569;
    --hms-text-3:           #94a3b8;
    --hms-font:             'DM Sans', system-ui, sans-serif;
    --hms-ease:             180ms cubic-bezier(0.4,0,0.2,1);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --hms-c-primary:        #14b8a6;
      --hms-c-primary-light:  #134e4a;
      --hms-c-danger-light:   #450a0a;
      --hms-c-success-light:  #064e3b;
      --hms-c-warning-light:  #451a03;
      --hms-c-info-light:     #1e3a5f;
      --hms-card-bg:          #1e293b;
      --hms-card-bg-2:        #162032;
      --hms-card-bg-3:        #0f172a;
      --hms-card-border:      rgba(255,255,255,0.08);
      --hms-card-border-md:   rgba(255,255,255,0.14);
      --hms-card-shadow-sm:   0 1px 3px rgba(0,0,0,0.3);
      --hms-card-shadow-md:   0 4px 16px rgba(0,0,0,0.4);
      --hms-card-shadow-lg:   0 8px 32px rgba(0,0,0,0.5);
      --hms-text-1:           #f1f5f9;
      --hms-text-2:           #94a3b8;
      --hms-text-3:           #475569;
    }
  }

  /* ── Base card ── */
  .hms-card {
    position:      relative;
    font-family:   var(--hms-font);
    border-radius: var(--hms-card-radius);
    background:    var(--hms-card-bg);
    border:        1px solid var(--hms-card-border);
    overflow:      hidden;
    display:       flex;
    flex-direction: column;
    transition:    box-shadow var(--hms-ease), border-color var(--hms-ease), transform var(--hms-ease);
  }

  /* Variants */
  .hms-card--default  { box-shadow: var(--hms-card-shadow-sm); }
  .hms-card--raised   { box-shadow: var(--hms-card-shadow-md); }
  .hms-card--flat     { box-shadow: none; background: var(--hms-card-bg-2); }
  .hms-card--outline  { box-shadow: none; border: 1.5px solid var(--hms-card-border-md); }
  .hms-card--ghost    { box-shadow: none; background: transparent; border-color: transparent; }

  /* Hoverable */
  .hms-card--hoverable:hover {
    box-shadow:     var(--hms-card-shadow-lg);
    border-color:   var(--hms-card-border-md);
    transform:      translateY(-2px);
    cursor:         pointer;
  }

  /* Clickable (full card is a button) */
  .hms-card--clickable {
    cursor: pointer;
  }
  .hms-card--clickable:hover {
    box-shadow:   var(--hms-card-shadow-lg);
    border-color: var(--hms-card-border-md);
    transform:    translateY(-2px);
  }
  .hms-card--clickable:active {
    transform: translateY(0) scale(0.995);
  }

  /* Accent left border */
  .hms-card--accent-primary { border-left: 3px solid var(--hms-c-primary); }
  .hms-card--accent-danger   { border-left: 3px solid var(--hms-c-danger); }
  .hms-card--accent-success  { border-left: 3px solid var(--hms-c-success); }
  .hms-card--accent-warning  { border-left: 3px solid var(--hms-c-warning); }
  .hms-card--accent-info     { border-left: 3px solid var(--hms-c-info); }

  /* Sizes */
  .hms-card--sm { border-radius: var(--hms-card-radius-sm); }

  /* ── Card.Header ── */
  .hms-card__header {
    display:         flex;
    align-items:     flex-start;
    justify-content: space-between;
    gap:             12px;
    padding:         var(--hms-card-pad);
    padding-bottom:  0;
  }
  .hms-card__header--with-divider {
    padding-bottom:  var(--hms-card-pad);
    border-bottom:   1px solid var(--hms-card-border);
  }
  .hms-card__header-left  { display: flex; align-items: flex-start; gap: 12px; min-width: 0; flex: 1; }
  .hms-card__header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .hms-card__icon-wrap {
    display:         flex;
    align-items:     center;
    justify-content: center;
    width:           38px;
    height:          38px;
    border-radius:   10px;
    background:      var(--hms-card-bg-3);
    flex-shrink:     0;
    font-size:       18px;
    color:           var(--hms-c-primary);
  }
  .hms-card__icon-wrap--primary { background: var(--hms-c-primary-light); color: var(--hms-c-primary); }
  .hms-card__icon-wrap--danger  { background: var(--hms-c-danger-light);  color: var(--hms-c-danger);  }
  .hms-card__icon-wrap--success { background: var(--hms-c-success-light); color: var(--hms-c-success); }
  .hms-card__icon-wrap--warning { background: var(--hms-c-warning-light); color: var(--hms-c-warning); }
  .hms-card__icon-wrap--info    { background: var(--hms-c-info-light);    color: var(--hms-c-info);    }

  .hms-card__title-wrap { min-width: 0; }
  .hms-card__title {
    font-size:   15px;
    font-weight: 600;
    color:       var(--hms-text-1);
    line-height: 1.3;
    margin:      0;
    white-space: nowrap;
    overflow:    hidden;
    text-overflow: ellipsis;
  }
  .hms-card__subtitle {
    font-size:   12px;
    color:       var(--hms-text-3);
    margin-top:  2px;
    line-height: 1.4;
  }

  /* ── Card.Body ── */
  .hms-card__body {
    padding: var(--hms-card-pad);
    flex:    1;
    color:   var(--hms-text-2);
    font-size: 13.5px;
    line-height: 1.6;
  }
  .hms-card__body--compact  { padding: var(--hms-card-pad-sm); }
  .hms-card__body--flush    { padding: 0; }
  .hms-card__body--scroll   { overflow-y: auto; }

  /* ── Card.Footer ── */
  .hms-card__footer {
    display:         flex;
    align-items:     center;
    justify-content: flex-end;
    gap:             8px;
    padding:         14px var(--hms-card-pad);
    border-top:      1px solid var(--hms-card-border);
    background:      var(--hms-card-bg-2);
  }
  .hms-card__footer--start   { justify-content: flex-start; }
  .hms-card__footer--between { justify-content: space-between; }
  .hms-card__footer--center  { justify-content: center; }

  /* ── Card.Divider ── */
  .hms-card__divider {
    height:     1px;
    background: var(--hms-card-border);
    margin:     0 var(--hms-card-pad);
    flex-shrink: 0;
  }
  .hms-card__divider--flush { margin: 0; }

  /* ── Card.Badge ── */
  .hms-card__badge {
    display:       inline-flex;
    align-items:   center;
    gap:           5px;
    padding:       3px 10px;
    border-radius: 99px;
    font-size:     11px;
    font-weight:   600;
    letter-spacing: 0.02em;
    line-height:   1;
    white-space:   nowrap;
  }
  .hms-card__badge--dot::before {
    content:       '';
    display:       block;
    width:         6px;
    height:        6px;
    border-radius: 50%;
    background:    currentColor;
    flex-shrink:   0;
  }
  .hms-card__badge--primary { background: var(--hms-c-primary-light); color: var(--hms-c-primary); }
  .hms-card__badge--danger  { background: var(--hms-c-danger-light);  color: var(--hms-c-danger);  }
  .hms-card__badge--success { background: var(--hms-c-success-light); color: var(--hms-c-success); }
  .hms-card__badge--warning { background: var(--hms-c-warning-light); color: var(--hms-c-warning); }
  .hms-card__badge--info    { background: var(--hms-c-info-light);    color: var(--hms-c-info);    }
  .hms-card__badge--neutral { background: var(--hms-card-bg-3);       color: var(--hms-text-2);    }

  /* ── Card.Stat ── */
  .hms-card__stat {
    display:        flex;
    flex-direction: column;
    gap:            4px;
  }
  .hms-card__stat-value {
    font-size:   28px;
    font-weight: 600;
    color:       var(--hms-text-1);
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .hms-card__stat-label {
    font-size:  12px;
    color:      var(--hms-text-3);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .hms-card__stat-trend {
    display:     inline-flex;
    align-items: center;
    gap:         3px;
    font-size:   12px;
    font-weight: 600;
    margin-top:  4px;
  }
  .hms-card__stat-trend--up   { color: var(--hms-c-success); }
  .hms-card__stat-trend--down { color: var(--hms-c-danger); }
  .hms-card__stat-trend--flat { color: var(--hms-text-3); }

  /* ── Card.Media ── */
  .hms-card__media {
    width:       100%;
    overflow:    hidden;
    flex-shrink: 0;
  }
  .hms-card__media img {
    width:      100%;
    height:     100%;
    object-fit: cover;
    display:    block;
  }
  .hms-card__media--color {
    display:         flex;
    align-items:     center;
    justify-content: center;
  }

  /* Loading skeleton */
  @keyframes hms-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .hms-card--loading .hms-card__title,
  .hms-card--loading .hms-card__subtitle,
  .hms-card__skeleton {
    background:      linear-gradient(90deg, var(--hms-card-bg-3) 25%, var(--hms-card-bg-2) 50%, var(--hms-card-bg-3) 75%);
    background-size: 600px 100%;
    animation:       hms-shimmer 1.4s ease-in-out infinite;
    border-radius:   4px;
    color:           transparent !important;
    user-select:     none;
  }
`;

let cardStylesInjected = false;
function injectCardStyles() {
  if (cardStylesInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.setAttribute("data-hms-card", "");
  el.textContent = CARD_STYLES;
  document.head.appendChild(el);
  cardStylesInjected = true;
}

// ─────────────────────────────────────────────────────────────
// 2. Card (base)
// ─────────────────────────────────────────────────────────────
/**
 * @param {'default'|'flat'|'raised'|'outline'|'ghost'}  variant
 * @param {'primary'|'danger'|'success'|'warning'|'info'} accent  — coloured left border
 * @param {boolean} hoverable   — lifts on hover (visual cue only)
 * @param {boolean} clickable   — lifts + pointer + active press (use with onClick)
 * @param {boolean} loading     — shimmer skeleton mode
 * @param {'sm'|'md'}           size
 * @param {string}  className
 * @param {object}  style
 */
const Card = forwardRef(({
  children,
  variant   = "default",
  accent,
  hoverable = false,
  clickable = false,
  loading   = false,
  size      = "md",
  className = "",
  style     = {},
  onClick,
  ...rest
}, ref) => {
  injectCardStyles();

  const classes = [
    "hms-card",
    `hms-card--${variant}`,
    accent    && `hms-card--accent-${accent}`,
    hoverable && "hms-card--hoverable",
    clickable && "hms-card--clickable",
    loading   && "hms-card--loading",
    size === "sm" && "hms-card--sm",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      style={style}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable && onClick
        ? (e) => (e.key === "Enter" || e.key === " ") && onClick(e)
        : undefined}
      {...rest}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

// ─────────────────────────────────────────────────────────────
// 3. Card.Header
// ─────────────────────────────────────────────────────────────
/**
 * @param {React.ReactNode}  icon       — svg or emoji inside tinted circle
 * @param {'primary'|'danger'|'success'|'warning'|'info'}  iconColor
 * @param {string}           title
 * @param {string}           subtitle
 * @param {React.ReactNode}  actions    — right-side buttons / badges
 * @param {boolean}          divider    — show bottom border
 */
Card.Header = function CardHeader({
  icon,
  iconColor = "primary",
  title,
  subtitle,
  actions,
  divider = false,
  className = "",
  children,
  ...rest
}) {
  return (
    <div
      className={[
        "hms-card__header",
        divider && "hms-card__header--with-divider",
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className="hms-card__header-left">
        {icon && (
          <div className={`hms-card__icon-wrap hms-card__icon-wrap--${iconColor}`}>
            {icon}
          </div>
        )}
        <div className="hms-card__title-wrap">
          {title    && <h3 className="hms-card__title">{title}</h3>}
          {subtitle && <p  className="hms-card__subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
      {actions && (
        <div className="hms-card__header-right">{actions}</div>
      )}
    </div>
  );
};
Card.Header.displayName = "Card.Header";

// ─────────────────────────────────────────────────────────────
// 4. Card.Body
// ─────────────────────────────────────────────────────────────
/**
 * @param {'default'|'compact'|'flush'} padding
 * @param {boolean} scroll  — overflow-y: auto
 * @param {string}  maxHeight — e.g. "320px" when scroll=true
 */
Card.Body = function CardBody({
  children,
  padding   = "default",
  scroll    = false,
  maxHeight,
  className = "",
  style     = {},
  ...rest
}) {
  const padClass =
    padding === "compact" ? "hms-card__body--compact"
    : padding === "flush" ? "hms-card__body--flush"
    : "";

  return (
    <div
      className={[
        "hms-card__body",
        padClass,
        scroll && "hms-card__body--scroll",
        className,
      ].filter(Boolean).join(" ")}
      style={{ ...(maxHeight ? { maxHeight } : {}), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};
Card.Body.displayName = "Card.Body";

// ─────────────────────────────────────────────────────────────
// 5. Card.Footer
// ─────────────────────────────────────────────────────────────
/**
 * @param {'end'|'start'|'between'|'center'} align
 */
Card.Footer = function CardFooter({
  children,
  align     = "end",
  className = "",
  ...rest
}) {
  return (
    <div
      className={[
        "hms-card__footer",
        align !== "end" && `hms-card__footer--${align}`,
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
};
Card.Footer.displayName = "Card.Footer";

// ─────────────────────────────────────────────────────────────
// 6. Card.Divider
// ─────────────────────────────────────────────────────────────
Card.Divider = function CardDivider({ flush = false, className = "" }) {
  return (
    <hr className={["hms-card__divider", flush && "hms-card__divider--flush", className].filter(Boolean).join(" ")} />
  );
};
Card.Divider.displayName = "Card.Divider";

// ─────────────────────────────────────────────────────────────
// 7. Card.Badge
// ─────────────────────────────────────────────────────────────
/**
 * @param {'primary'|'danger'|'success'|'warning'|'info'|'neutral'} color
 * @param {boolean} dot  — coloured dot prefix
 */
Card.Badge = function CardBadge({
  children,
  color     = "neutral",
  dot       = false,
  className = "",
  ...rest
}) {
  return (
    <span
      className={[
        "hms-card__badge",
        `hms-card__badge--${color}`,
        dot && "hms-card__badge--dot",
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
};
Card.Badge.displayName = "Card.Badge";

// ─────────────────────────────────────────────────────────────
// 8. Card.Stat
// ─────────────────────────────────────────────────────────────
/**
 * @param {string|number}  value    — the big number / metric
 * @param {string}         label    — descriptor below the number
 * @param {number}         trend    — positive = up arrow, negative = down arrow, 0 = flat
 * @param {string}         trendLabel — e.g. "vs last month"
 */

const TrendArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const TrendArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

Card.Stat = function CardStat({
  value,
  label,
  trend,
  trendLabel,
  className = "",
  ...rest
}) {
  const trendDir = trend > 0 ? "up" : trend < 0 ? "down" : "flat";

  return (
    <div className={["hms-card__stat", className].filter(Boolean).join(" ")} {...rest}>
      <div className="hms-card__stat-label">{label}</div>
      <div className="hms-card__stat-value">{value}</div>
      {trend !== undefined && (
        <div className={`hms-card__stat-trend hms-card__stat-trend--${trendDir}`}>
          {trendDir === "up"   && <TrendArrowUp />}
          {trendDir === "down" && <TrendArrowDown />}
          {Math.abs(trend)}%
          {trendLabel && (
            <span style={{ fontWeight: 400, color: "var(--hms-text-3)", marginLeft: 4 }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
Card.Stat.displayName = "Card.Stat";

// ─────────────────────────────────────────────────────────────
// 9. Card.Media
// ─────────────────────────────────────────────────────────────
/**
 * @param {string} src       — image URL (optional)
 * @param {string} alt
 * @param {string} height    — e.g. "160px"
 * @param {string} color     — fallback bg colour (hex / CSS var)
 * @param {React.ReactNode} children — overlay content
 */
Card.Media = function CardMedia({
  src,
  alt       = "",
  height    = "140px",
  color     = "var(--hms-c-primary-light)",
  children,
  className = "",
  style     = {},
  ...rest
}) {
  return (
    <div
      className={["hms-card__media", !src && "hms-card__media--color", className].filter(Boolean).join(" ")}
      style={{ height, background: !src ? color : undefined, ...style }}
      {...rest}
    >
      {src
        ? <img src={src} alt={alt} />
        : children}
    </div>
  );
};
Card.Media.displayName = "Card.Media";

export default Card;


// ─────────────────────────────────────────────────────────────
//  USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────
//
//  import Card from "@/components/common/Card";
//
//  ── Basic card ───────────────────────────────────────────────
//  <Card>
//    <Card.Header title="Room 204" subtitle="Block A — 3rd Floor" />
//    <Card.Body>Double occupancy · AC · Attached bath</Card.Body>
//    <Card.Footer>
//      <Button variant="secondary" size="sm">View</Button>
//      <Button size="sm">Allocate</Button>
//    </Card.Footer>
//  </Card>
//
//  ── Stat card (dashboard) ─────────────────────────────────────
//  <Card variant="raised">
//    <Card.Body>
//      <Card.Stat value="248" label="Total Students" trend={12} trendLabel="vs last month" />
//    </Card.Body>
//  </Card>
//
//  ── Accent + badge ────────────────────────────────────────────
//  <Card accent="danger">
//    <Card.Header
//      title="Pending Complaints"
//      subtitle="Requires action"
//      iconColor="danger"
//      icon={<AlertIcon />}
//      actions={<Card.Badge color="danger" dot>5 open</Card.Badge>}
//      divider
//    />
//    <Card.Body>…complaint list…</Card.Body>
//  </Card>
//
//  ── Clickable card ────────────────────────────────────────────
//  <Card clickable onClick={() => navigate(`/rooms/${room.id}`)}>
//    <Card.Header title={room.number} subtitle={room.block} />
//    <Card.Body>…</Card.Body>
//  </Card>
//
//  ── Loading skeleton ─────────────────────────────────────────
//  <Card loading>
//    <Card.Header title="████████" subtitle="███████████" />
//    <Card.Body>
//      <div className="hms-card__skeleton" style={{height:12,width:'80%',marginBottom:8}} />
//      <div className="hms-card__skeleton" style={{height:12,width:'60%'}} />
//    </Card.Body>
//  </Card>
//
//  ── Media card ───────────────────────────────────────────────
//  <Card variant="raised">
//    <Card.Media src="/hostel-photo.jpg" height="180px" alt="Hostel front" />
//    <Card.Header title="Green Valley Hostel" subtitle="Sector 12, Bengaluru" />
//    <Card.Body>…</Card.Body>
//  </Card>