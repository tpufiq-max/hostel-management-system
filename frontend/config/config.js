// ─── App Config ────────────────────────────────────────────────────────────────
export const APP_NAME = "Hostel Management System";
export const APP_VERSION = "1.0.0";

// ─── API Base URL ───────────────────────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ─── Auth ───────────────────────────────────────────────────────────────────────
export const TOKEN_KEY = "hms_token";
export const USER_KEY  = "hms_user";

// ─── Roles ──────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:   "admin",
  WARDEN:  "warden",
  STUDENT: "student",
};

// ─── Room Types ─────────────────────────────────────────────────────────────────
export const ROOM_TYPES = ["Single", "Double", "Triple", "Dormitory"];

// ─── Room Status ────────────────────────────────────────────────────────────────
export const ROOM_STATUS = {
  AVAILABLE:  "available",
  OCCUPIED:   "occupied",
  MAINTENANCE:"maintenance",
};

// ─── Fee Status ─────────────────────────────────────────────────────────────────
export const FEE_STATUS = {
  PAID:    "paid",
  PENDING: "pending",
  OVERDUE: "overdue",
};

// ─── Complaint Status ───────────────────────────────────────────────────────────
export const COMPLAINT_STATUS = {
  OPEN:        "open",
  IN_PROGRESS: "in_progress",
  RESOLVED:    "resolved",
  CLOSED:      "closed",
};

// ─── Pagination ─────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;

// ─── Date Format ────────────────────────────────────────────────────────────────
export const DATE_FORMAT = "DD/MM/YYYY";