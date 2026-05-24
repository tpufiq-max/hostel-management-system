// Dashboard service — talks to the real backend.
//
// Backend endpoint: GET /api/dashboard/stats
// Backend wraps every response in:
//   { success: boolean, message: string, data: T, errors?: ... }
//
// Different versions of api.js have shipped different unwrap behaviours
// (some return the full envelope, some auto-unwrap to .data). This module
// is defensive: it accepts either shape so the caller always gets a clean
// stats object.

import { get } from "../../api/api";

/**
 * Returns dashboard stats from the backend.
 * Shape:
 * {
 *   totalStudents, activeStudents,
 *   totalRooms, occupiedRooms,
 *   totalRevenue, pendingPayments,
 *   totalComplaints, resolvedComplaints, openComplaints,
 *   occupancyRate
 * }
 */
export async function getDashboardStats() {
  const response = await get("/dashboard/stats");
  return unwrap(response);
}

/**
 * Some versions of the api layer auto-unwrap to `data`, others return the
 * full envelope. Handle both so this service doesn't have to care which
 * one is in play right now.
 */
function unwrap(response) {
  if (response == null) return null;
  // Full envelope { success, message, data: {...} }
  if (typeof response === "object" && "data" in response && "success" in response) {
    return response.data ?? null;
  }
  // Already the payload
  return response;
}

export default {
  getDashboardStats,
};
