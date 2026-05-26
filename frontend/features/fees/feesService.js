import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Fee API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/FeeController.java):
 *   GET    /api/fees[?page=0&size=10]
 *   GET    /api/fees/{id}
 *   GET    /api/fees/student/{studentId}
 *   POST   /api/fees
 *   PUT    /api/fees/{id}
 *   DELETE /api/fees/{id}
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const feesService = {
  list({ page = 0, size = 20 } = {}) {
    return get(`/fees${buildQuery({ page, size })}`);
  },

  byStudent(studentId) {
    return get(`/fees/student/${studentId}`);
  },

  getById(id) {
    return get(`/fees/${id}`);
  },

  create(payload) {
    return post(`/fees`, payload);
  },

  update(id, payload) {
    return apiPut(`/fees/${id}`, payload);
  },

  remove(id) {
    return del(`/fees/${id}`);
  },
};

export default feesService;
