import { get, post, del } from "../../api/api";

/**
 * Allocation API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/AllocationController.java):
 *   GET    /api/allocation[?page=0&size=20]   — all students with a room assigned
 *   POST   /api/allocation                    — body: {studentId, roomId}
 *   DELETE /api/allocation/{studentId}        — remove student from room
 *
 * The shared response interceptor unwraps the {success, data, message}
 * envelope so callers receive the inner DTO/Page object directly.
 */

function buildQuery(params = {}) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") s.set(k, v);
  });
  const qs = s.toString();
  return qs ? `?${qs}` : "";
}

export const allocationService = {
  list({ page = 0, size = 20 } = {}) {
    return get(`/allocation${buildQuery({ page, size })}`);
  },

  allocate(studentId, roomId) {
    return post(`/allocation`, { studentId, roomId });
  },

  deallocate(studentId) {
    return del(`/allocation/${studentId}`);
  },
};

export default allocationService;
