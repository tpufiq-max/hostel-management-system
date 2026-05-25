// Analytics service — talks to /api/analytics/*.
//
// Endpoints
//   GET /analytics/summary
//   GET /analytics/revenue
//   GET /analytics/occupancy
//   GET /analytics/complaints
//   GET /analytics/attendance

import { get } from "../../api/api";

function unwrap(res) {
  if (res == null) return null;
  if (typeof res === "object" && "data" in res && "success" in res) {
    return res.data ?? null;
  }
  return res;
}

/** GET /api/analytics/summary */
export async function getSummary() {
  const res = await get("/analytics/summary");
  return unwrap(res);
}

/** GET /api/analytics/revenue */
export async function getRevenue() {
  const res = await get("/analytics/revenue");
  return unwrap(res);
}

/** GET /api/analytics/occupancy */
export async function getOccupancy() {
  const res = await get("/analytics/occupancy");
  return unwrap(res);
}

/** GET /api/analytics/complaints */
export async function getComplaints() {
  const res = await get("/analytics/complaints");
  return unwrap(res);
}

/** GET /api/analytics/attendance */
export async function getAttendance() {
  const res = await get("/analytics/attendance");
  return unwrap(res);
}

const analyticsService = {
  getSummary,
  getRevenue,
  getOccupancy,
  getComplaints,
  getAttendance,
};

export default analyticsService;
