import { get, post, put as apiPut } from "../../api/api";

/**
 * Attendance API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/AttendanceController.java):
 *   GET  /api/attendance/date/{date}                        (yyyy-MM-dd)
 *   GET  /api/attendance/student/{studentId}?startDate=&endDate=
 *   POST /api/attendance                                    (mark one)
 *   POST /api/attendance/bulk                               (mark many)
 *   PUT  /api/attendance/{id}                               (update existing)
 *
 * The shared response interceptor unwraps the {success, data, message}
 * envelope so callers receive the inner DTO/List directly.
 *
 * Note: there's no DELETE endpoint and no full-list GET; pulling
 * attendance always requires either a date or a (student, range) pair.
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const attendanceService = {
  /** @param {string} date yyyy-MM-dd */
  byDate(date) {
    return get(`/attendance/date/${date}`);
  },

  /** @param {string} startDate yyyy-MM-dd  @param {string} endDate yyyy-MM-dd */
  byStudent(studentId, { startDate, endDate }) {
    return get(`/attendance/student/${studentId}${buildQuery({ startDate, endDate })}`);
  },

  mark(payload) {
    return post(`/attendance`, payload);
  },

  markBulk(payloadList) {
    return post(`/attendance/bulk`, payloadList);
  },

  update(id, payload) {
    return apiPut(`/attendance/${id}`, payload);
  },
};

export default attendanceService;
