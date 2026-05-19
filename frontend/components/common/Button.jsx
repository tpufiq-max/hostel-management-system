// src/components/common/Button.jsx
// ─────────────────────────────────────────────────────────────
//  Hostel Management System — Button Component
//  Variants: primary | secondary | danger | ghost | outline | success
//  Sizes:    xs | sm | md | lg
//  Extras:   loading spinner, left/right icon, icon-only, full-width
// ─────────────────────────────────────────────────────────────

import React from "react";

// ── Spinner SVG ───────────────────────────────────────────────
const Spinner = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="hms-btn__spinner"
    aria-hidden="true"
  >
    <circle
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeOpacity="0.25"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

// ── Size map ──────────────────────────────────────────────────
const SIZE = {
  xs: { height: "28px",  fontSize: "11px", padding: "0 10px", iconSize: 13, gap: "5px",  spinnerSize: 13 },
  sm: { height: "34px",  fontSize: "12px", padding: "0 14px", iconSize: 14, gap: "6px",  spinnerSize: 14 },
  md: { height: "40px",  fontSize: "13px", padding: "0 18px", iconSize: 16, gap: "7px",  spinnerSize: 16 },
  lg: { height: "48px",  fontSize: "15px", padding: "0 24px", iconSize: 18, gap: "8px",  spinnerSize: 18 },
};

// ── Variant map ───────────────────────────────────────────────
const VARIANT = {
  primary: {
    background:      "var(--hms-color-primary)",
    color:           "#ffffff",
    border:          "1.5px solid var(--hms-color-primary)",
    hoverBackground: "var(--hms-color-primary-dark)",
    hoverBorder:     "1.5px solid var(--hms-color-primary-dark)",
    activeScale:     "scale(0.975)",
    shadow:          "0 1px 3px rgba(15,118,110,0.25), 0 4px 12px rgba(15,118,110,0.15)",
  },
  secondary: {
    background:      "var(--hms-color-surface)",
    color:           "var(--hms-color-text-primary)",
    border:          "1.5px solid var(--hms-color-border)",
    hoverBackground: "var(--hms-color-surface-hover)",
    hoverBorder:     "1.5px solid var(--hms-color-border-strong)",
    activeScale:     "scale(0.975)",
    shadow:          "0 1px 3px rgba(0,0,0,0.07)",
  },
  danger: {
    background:      "var(--hms-color-danger)",
    color:           "#ffffff",
    border:          "1.5px solid var(--hms-color-danger)",
    hoverBackground: "var(--hms-color-danger-dark)",
    hoverBorder:     "1.5px solid var(--hms-color-danger-dark)",
    activeScale:     "scale(0.975)",
    shadow:          "0 1px 3px rgba(220,38,38,0.25), 0 4px 12px rgba(220,38,38,0.12)",
  },
  success: {
    background:      "var(--hms-color-success)",
    color:           "#ffffff",
    border:          "1.5px solid var(--hms-color-success)",
    hoverBackground: "var(--hms-color-success-dark)",
    hoverBorder:     "1.5px solid var(--hms-color-success-dark)",
    activeScale:     "scale(0.975)",
    shadow:          "0 1px 3px rgba(5,150,105,0.25), 0 4px 12px rgba(5,150,105,0.12)",
  },
  ghost: {
    background:      "transparent",
    color:           "var(--hms-color-text-secondary)",
    border:          "1.5px solid transparent",
    hoverBackground: "var(--hms-color-surface-hover)",
    hoverBorder:     "1.5px solid transparent",
    activeScale:     "scale(0.975)",
    shadow:          "none",
  },
  outline: {
    background:      "transparent",
    color:           "var(--hms-color-primary)",
    border:          "1.5px solid var(--hms-color-primary)",
    hoverBackground: "rgba(15,118,110,0.06)",
    hoverBorder:     "1.5px solid var(--hms-color-primary)",
    activeScale:     "scale(0.975)",
    shadow:          "none",
  },
};

// ── CSS injection (once) ──────────────────────────────────────
const STYLES = `
  :root {
    --hms-color-primary:       #0f766e;
    --hms-color-primary-dark:  #0d6460;
    --hms-color-danger:        #dc2626;
    --hms-color-danger-dark:   #b91c1c;
    --hms-color-success:       #059669;
    --hms-color-success-dark:  #047857;
    --hms-color-surface:       #ffffff;
    --hms-color-surface-hover: #f8fafc;
    --hms-color-border:        rgba(0,0,0,0.12);
    --hms-color-border-strong: rgba(0,0,0,0.22);
    --hms-color-text-primary:  #0f172a;
    --hms-color-text-secondary:#475569;
    --hms-radius-btn:          8px;
    --hms-transition:          140ms cubic-bezier(0.4,0,0.2,1);
    --hms-font:                'DM Sans', 'Outfit', system-ui, sans-serif;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --hms-color-primary:       #14b8a6;
      --hms-color-primary-dark:  #0d9488;
      --hms-color-surface:       #1e293b;
      --hms-color-surface-hover: #273449;
      --hms-color-border:        rgba(255,255,255,0.1);
      --hms-color-border-strong: rgba(255,255,255,0.2);
      --hms-color-text-primary:  #f1f5f9;
      --hms-color-text-secondary:#94a3b8;
    }
  }

  .hms-btn {
    display:         inline-flex;
    align-items:     center;
    justify-content: center;
    gap:             var(--_gap);
    height:          var(--_height);
    padding:         var(--_padding);
    font-family:     var(--hms-font);
    font-size:       var(--_font-size);
    font-weight:     500;
    letter-spacing:  0.01em;
    line-height:     1;
    white-space:     nowrap;
    border-radius:   var(--hms-radius-btn);
    border:          var(--_border);
    background:      var(--_bg);
    color:           var(--_color);
    box-shadow:      var(--_shadow);
    cursor:          pointer;
    text-decoration: none;
    user-select:     none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background var(--hms-transition),
      border-color var(--hms-transition),
      color var(--hms-transition),
      box-shadow var(--hms-transition),
      transform 80ms ease,
      opacity var(--hms-transition);
    position: relative;
    overflow: hidden;
  }

  .hms-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    background: rgba(255,255,255,0.18);
    transition: opacity var(--hms-transition);
    pointer-events: none;
  }

  .hms-btn:hover:not(:disabled):not(.hms-btn--loading)::after {
    opacity: 1;
  }

  .hms-btn:hover:not(:disabled):not(.hms-btn--loading) {
    background:  var(--_bg-hover);
    border-color: var(--_border-hover-color);
  }

  .hms-btn:active:not(:disabled):not(.hms-btn--loading) {
    transform: var(--_active-scale);
  }

  .hms-btn:focus-visible {
    outline: 2.5px solid var(--hms-color-primary);
    outline-offset: 2px;
  }

  .hms-btn:disabled,
  .hms-btn--loading {
    opacity: 0.52;
    cursor: not-allowed;
    pointer-events: none;
  }

  .hms-btn--full { width: 100%; }

  /* Icon only — square */
  .hms-btn--icon-only {
    padding: 0;
    width: var(--_height);
  }

  /* Pill shape */
  .hms-btn--pill { border-radius: 999px; }

  /* Spinner animation */
  .hms-btn__spinner {
    animation: hms-spin 0.65s linear infinite;
    flex-shrink: 0;
  }

  @keyframes hms-spin {
    to { transform: rotate(360deg); }
  }

  /* Icon wrappers */
  .hms-btn__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 1;
  }

  .hms-btn__label {
    display: inline-flex;
    align-items: center;
  }

  /* Loading: hide label, keep space */
  .hms-btn--loading .hms-btn__label {
    opacity: 0;
  }
  .hms-btn--loading .hms-btn__spinner-wrap {
    position: absolute;
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.setAttribute("data-hms-button", "");
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

// ── Button Component ──────────────────────────────────────────
/**
 * @param {object}  props
 * @param {'primary'|'secondary'|'danger'|'ghost'|'outline'|'success'} props.variant
 * @param {'xs'|'sm'|'md'|'lg'}  props.size
 * @param {boolean} props.loading      - Shows spinner, disables interaction
 * @param {boolean} props.disabled
 * @param {boolean} props.fullWidth
 * @param {boolean} props.pill         - Fully rounded corners
 * @param {boolean} props.iconOnly     - Square button (icon without label)
 * @param {React.ReactNode} props.leftIcon
 * @param {React.ReactNode} props.rightIcon
 * @param {string}  props.loadingText  - Accessible label while loading
 * @param {'button'|'submit'|'reset'}  props.type
 * @param {string}  props.as           - Render as 'a', 'div', etc.
 * @param {string}  props.className
 * @param {function} props.onClick
 */
const Button = ({
  children,
  variant     = "primary",
  size        = "md",
  loading     = false,
  disabled    = false,
  fullWidth   = false,
  pill        = false,
  iconOnly    = false,
  leftIcon    = null,
  rightIcon   = null,
  loadingText = "Loading…",
  type        = "button",
  as: Tag     = "button",
  className   = "",
  onClick,
  style       = {},
  ...rest
}) => {
  injectStyles();

  const s = SIZE[size]   || SIZE.md;
  const v = VARIANT[variant] || VARIANT.primary;

  const classes = [
    "hms-btn",
    fullWidth  && "hms-btn--full",
    pill       && "hms-btn--pill",
    iconOnly   && "hms-btn--icon-only",
    loading    && "hms-btn--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cssVars = {
    "--_height":       s.height,
    "--_font-size":    s.fontSize,
    "--_padding":      iconOnly ? "0" : s.padding,
    "--_gap":          s.gap,
    "--_bg":           v.background,
    "--_bg-hover":     v.hoverBackground,
    "--_color":        v.color,
    "--_border":       v.border,
    "--_border-hover-color": v.hoverBorder.split(" ").pop(),
    "--_active-scale": v.activeScale,
    "--_shadow":       v.shadow,
    ...style,
  };

  const isDisabled = disabled || loading;

  return (
    <Tag
      type={Tag === "button" ? type : undefined}
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={loading ? loadingText : rest["aria-label"]}
      onClick={isDisabled ? undefined : onClick}
      className={classes}
      style={cssVars}
      {...rest}
    >
      {/* Spinner (absolutely centred when loading) */}
      {loading && (
        <span className="hms-btn__spinner-wrap" aria-hidden="true">
          <Spinner size={s.spinnerSize} />
        </span>
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span
          className="hms-btn__icon"
          style={{ fontSize: s.iconSize, width: s.iconSize, height: s.iconSize }}
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      )}

      {/* Label */}
      {!iconOnly && children && (
        <span className="hms-btn__label">{children}</span>
      )}

      {/* Icon-only content */}
      {iconOnly && !loading && children && (
        <span
          className="hms-btn__icon"
          style={{ fontSize: s.iconSize, width: s.iconSize, height: s.iconSize }}
          aria-hidden="true"
        >
          {children}
        </span>
      )}

      {/* Right icon */}
      {!loading && rightIcon && (
        <span
          className="hms-btn__icon"
          style={{ fontSize: s.iconSize, width: s.iconSize, height: s.iconSize }}
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </Tag>
  );
};

export default Button;


// ─────────────────────────────────────────────────────────────
//  USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────
//
//  import Button from "@/components/common/Button";
//  import { PlusIcon, TrashIcon } from "lucide-react";
//
//  // Basic variants
//  <Button>Save Changes</Button>
//  <Button variant="secondary">Cancel</Button>
//  <Button variant="danger">Delete Room</Button>
//  <Button variant="success">Approve</Button>
//  <Button variant="outline">View Details</Button>
//  <Button variant="ghost">Dismiss</Button>
//
//  // Sizes
//  <Button size="xs">Tiny</Button>
//  <Button size="sm">Small</Button>
//  <Button size="md">Medium</Button>   ← default
//  <Button size="lg">Large</Button>
//
//  // With icons
//  <Button leftIcon={<PlusIcon size={16} />}>Add Student</Button>
//  <Button variant="danger" rightIcon={<TrashIcon size={16} />}>Remove</Button>
//
//  // Loading state
//  <Button loading loadingText="Saving student…">Save</Button>
//
//  // Full width
//  <Button fullWidth>Submit Form</Button>
//
//  // Pill shape
//  <Button pill variant="success">Active</Button>
//
//  // Icon only (square)
//  <Button iconOnly aria-label="Add new"><PlusIcon /></Button>
//
//  // Rendered as anchor tag
//  <Button as="a" href="/dashboard" variant="outline">Go to Dashboard</Button>
//
//  // Disabled
//  <Button disabled>Not Available</Button>