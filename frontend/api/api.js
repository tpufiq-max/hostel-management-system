// src/api/api.js
// ─────────────────────────────────────────────────────────────
//  Hostel Management System — Base API Configuration
//  Axios instance with interceptors, token refresh & error handling
// ─────────────────────────────────────────────────────────────

import axios from "axios";

// ── 1. Constants ──────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const TIMEOUT  = 15_000; // 15 s

// Token keys stored in localStorage
const ACCESS_TOKEN_KEY  = "hms_access_token";
const REFRESH_TOKEN_KEY = "hms_refresh_token";

// ── 2. Token helpers ──────────────────────────────────────────
export const tokenService = {
  getAccess:      ()      => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh:     ()      => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens:      (a, r)  => {
    localStorage.setItem(ACCESS_TOKEN_KEY,  a);
    localStorage.setItem(REFRESH_TOKEN_KEY, r);
  },
  clearTokens:    ()      => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  isAccessValid:  ()      => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  },
};

// ── 3. Create Axios instance ──────────────────────────────────
const api = axios.create({
  baseURL:         BASE_URL,
  timeout:         TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept:         "application/json",
  },
  withCredentials: true, // send cookies if backend uses them
});

// ── 4. Request interceptor — attach Bearer token ──────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API ➜] ${config.method?.toUpperCase()} ${config.url}`, config.data ?? "");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── 5. Token refresh state (prevent multiple refresh calls) ───
let isRefreshing = false;
let failedQueue  = []; // requests queued while refreshing

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

// ── 6. Response interceptor — handle errors & auto-refresh ────
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API ✓] ${response.status} ${response.config.url}`);
    }
    // Unwrap data envelope if backend wraps in { success, data, message }
    return response.data?.data !== undefined ? response.data : response.data;
  },

  async (error) => {
    const originalRequest = error.config;

    // ── 6a. 401 — try silent token refresh ───────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = tokenService.getRefresh();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = data;
        tokenService.setTokens(accessToken, newRefresh);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization     = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenService.clearTokens();
        // Redirect to login
        window.dispatchEvent(new CustomEvent("hms:session-expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 6b. Normalise error shape ─────────────────────────────
    const apiError = normaliseError(error);

    if (import.meta.env.DEV) {
      console.error(`[API ✗] ${error.response?.status} ${originalRequest?.url}`, apiError.message);
    }

    return Promise.reject(apiError);
  }
);

// ── 7. Error normaliser ───────────────────────────────────────
/**
 * Returns a plain object so callers always get the same shape:
 * { message, status, code, errors }
 */
function normaliseError(error) {
  if (error.response) {
    // Server responded with 4xx / 5xx
    const { status, data } = error.response;
    return {
      message: data?.message || data?.error || getDefaultMessage(status),
      status,
      code:    data?.code    || null,
      errors:  data?.errors  || [],  // validation errors array
      raw:     data,
    };
  }

  if (error.request) {
    // Request made but no response (network down / timeout)
    return {
      message: "Network error — please check your connection.",
      status:  0,
      code:    "NETWORK_ERROR",
      errors:  [],
    };
  }

  // Unexpected setup error
  return {
    message: error.message || "Unexpected error occurred.",
    status:  -1,
    code:    "CLIENT_ERROR",
    errors:  [],
  };
}

function getDefaultMessage(status) {
  const messages = {
    400: "Bad request — please check your input.",
    401: "Session expired. Please log in again.",
    403: "You don't have permission to do that.",
    404: "Resource not found.",
    408: "Request timed out. Please try again.",
    409: "Conflict — this record already exists.",
    422: "Validation failed — check the form fields.",
    429: "Too many requests. Please slow down.",
    500: "Server error — please try again later.",
    502: "Bad gateway — server is temporarily unavailable.",
    503: "Service unavailable — maintenance in progress.",
  };
  return messages[status] || `Unexpected error (${status}).`;
}

// ── 8. Convenience request wrappers ──────────────────────────
/**
 * Use these instead of api.get / api.post for cleaner call sites:
 *
 *   import { get, post } from "@/api/api";
 *   const students = await get("/students");
 *   const result   = await post("/students", payload);
 */
export const get    = (url, config)         => api.get(url, config);
export const post   = (url, data, config)   => api.post(url, data, config);
export const put    = (url, data, config)   => api.put(url, data, config);
export const patch  = (url, data, config)   => api.patch(url, data, config);
export const del    = (url, config)         => api.delete(url, config);

// Multipart upload helper (for profile photos, documents, etc.)
export const upload = (url, formData, onProgress) =>
  api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });

export default api;