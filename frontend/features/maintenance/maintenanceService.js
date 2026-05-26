import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Maintenance request API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/MaintenanceRequestController.java):
 *   GET    /api/maintenance[?status=OPEN&priority=HIGH&category=ELECTRICAL&page=0&size=20]
 *   GET    /api/maintenance/{id}
 *   POST   /api/maintenance
 *   PUT    /api/maintenance/{id}
 *   DELETE /api/maintenance/{id}
 *
 * The response interceptor in api/api.js unwraps the {success, data, message}
 * envelope so callers receive the inner DTO/Page object directly.
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const maintenanceService = {
  /**
   * @param {{page?: number, size?: number, status?: string, priority?: string, category?: string}} [opts]
   */
  list({ page = 0, size = 20, status, priority, category } = {}) {
    return get(`/maintenance${buildQuery({ page, size, status, priority, category })}`);
  },

  getById(id) {
    return get(`/maintenance/${id}`);
  },

  create(payload) {
    return post(`/maintenance`, payload);
  },

  update(id, payload) {
    return apiPut(`/maintenance/${id}`, payload);
  },

  remove(id) {
    return del(`/maintenance/${id}`);
  },
};

export default maintenanceService;
