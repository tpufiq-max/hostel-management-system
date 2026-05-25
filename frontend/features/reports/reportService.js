// Report service — combines dashboard stats and analytics summary.
//
// Endpoints used:
//   GET /dashboard/stats
//   GET /analytics/summary

import { get } from "../../api/api";

function unwrap(res) {
  if (res == null) return null;
  if (typeof res === "object" && "data" in res && "success" in res) {
    return res.data ?? null;
  }
  return res;
}

/**
 * Fetches combined report data from dashboard and analytics endpoints.
 * Returns an object with fields from both sources.
 */
export async function getReportData() {
  const [dashRes, analyticsRes] = await Promise.all([
    get("/dashboard/stats"),
    get("/analytics/summary"),
  ]);
  const dashboard = unwrap(dashRes) || {};
  const analytics = unwrap(analyticsRes) || {};
  return { ...dashboard, ...analytics };
}

const reportService = {
  getReportData,
};

export default reportService;
