import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Complaint API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/ComplaintController.java):
 *   GET    /api/complaints[?page=0&size=10]
 *   GET    /api/complaints/{id}
 *   GET    /api/complaints/student/{studentId}
 *   POST   /api/complaints
 *   PUT    /api/complaints/{id}
 *   DELETE /api/complaints/{id}
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const complaintService = {
  list({ page = 0, size = 20 } = {}) {
    return get(`/complaints${buildQuery({ page, size })}`);
  },

  byStudent(studentId) {
    return get(`/complaints/student/${studentId}`);
  },

  getById(id) {
    return get(`/complaints/${id}`);
  },

  create(payload) {
    return post(`/complaints`, payload);
  },

  update(id, payload) {
    return apiPut(`/complaints/${id}`, payload);
  },

  remove(id) {
    return del(`/complaints/${id}`);
  },
};

export default complaintService;
