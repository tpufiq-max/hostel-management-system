// ─────────────────────────────────────────────────────────────────────────────
//  Formatters — pure functions used across pages.
//
//  Keep these dependency-free and locale-aware. Used by tables, cards, and
//  detail views in F4 onwards.
// ─────────────────────────────────────────────────────────────────────────────

import { CURRENCY_CODE, DATE_LOCALE } from "../constants";

/**
 * Format a number as Indian Rupees (or whichever CURRENCY_CODE is set to).
 * Returns "—" for null/undefined so tables don't show "₹NaN".
 */
export function formatCurrency(value, options = {}) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat(DATE_LOCALE, {
    style: "currency",
    currency: options.currency ?? CURRENCY_CODE,
    maximumFractionDigits: options.fractionDigits ?? 0,
    ...options,
  }).format(Number(value));
}

/**
 * Format a date as "12 Jan 2025". Accepts Date, ISO string, or null.
 */
export function formatDate(value, options) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/**
 * Format a datetime as "12 Jan 2025, 4:30 PM".
 */
export function formatDateTime(value, options) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  });
}

/**
 * Returns a human-friendly relative time like "2 minutes ago", "3 days ago".
 * Uses the platform RelativeTimeFormat API and falls back to formatDate for
 * dates older than 30 days.
 */
export function formatRelativeTime(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  const diffHr  = Math.round(diffMs / 3_600_000);
  const diffDay = Math.round(diffMs / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat(DATE_LOCALE, { numeric: "auto" });

  if (Math.abs(diffMin) < 1)  return "just now";
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr,  "hour");
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");

  return formatDate(date);
}

/**
 * Sentence-case helper for enum values like "in_progress" → "In progress".
 */
export function humaniseEnum(value) {
  if (value == null) return "";
  return String(value)
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/^(\w)/, (m) => m.toUpperCase());
}

/**
 * Return the user's initials for an avatar — "John Doe" → "JD".
 */
export function getInitials(name, fallback = "U") {
  if (!name || typeof name !== "string") return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/**
 * Truncate a string to maxLen characters and add an ellipsis if needed.
 */
export function truncate(value, maxLen = 60) {
  if (value == null) return "";
  const str = String(value);
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}
