// ─────────────────────────────────────────────────────────────────────────────
//  Frontend constants — single source of truth for app-wide enums, keys, and
//  configuration. Anything that more than one module needs goes here.
// ─────────────────────────────────────────────────────────────────────────────

// ── App ──────────────────────────────────────────────────────────────────────
export const APP_NAME    = "Hostel Management System";
export const APP_VERSION = "1.0.0";

// ── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ── localStorage keys (must stay in sync with api/api.js tokenService) ───────
export const ACCESS_TOKEN_KEY  = "hms_access_token";
export const REFRESH_TOKEN_KEY = "hms_refresh_token";
export const USER_KEY          = "hms_user";
export const THEME_KEY         = "hms_theme";

// ── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
  ADMIN:   "admin",
  WARDEN:  "warden",
  STUDENT: "student",
});

// ── Domain enums (mirror backend entities) ───────────────────────────────────
export const ROOM_TYPES = ["Single", "Double", "Triple", "Dormitory"];

export const ROOM_STATUS = Object.freeze({
  AVAILABLE:   "available",
  OCCUPIED:    "occupied",
  MAINTENANCE: "maintenance",
});

export const FEE_STATUS = Object.freeze({
  PAID:    "paid",
  PENDING: "pending",
  OVERDUE: "overdue",
});

export const COMPLAINT_STATUS = Object.freeze({
  OPEN:        "open",
  IN_PROGRESS: "in_progress",
  RESOLVED:    "resolved",
  CLOSED:      "closed",
});

// ── UI defaults ──────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Locale / formatting ──────────────────────────────────────────────────────
export const DATE_LOCALE   = "en-IN";
export const CURRENCY_CODE = "INR";
