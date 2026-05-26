import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Visitor API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/VisitorController.java):
 *   GET    /api/visitors[?status=CHECKED_IN&page=0&size=20]
 *   GET    /api/visitors/{id}
 *   POST   /api/visitors
 *   PUT    /api/visitors/{id}
 *   PUT    /api/visitors/{id}/checkout
 *   DELETE /api/visitors/{id}
 *
 * The response interceptor in api/api.js unwraps the {success, data, message}
 * envelope, so callers receive the inner DTO/Page object directly.
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const visitorService = {
  /**
   * @param {{page?: number, size?: number, status?: 'CHECKED_IN'|'CHECKED_OUT'|'REJECTED'}} [opts]
   * @returns {Promise<{content: Visitor[], totalElements: number, totalPages: number, number: number, size: number}>}
   */
  list({ page = 0, size = 20, status } = {}) {
    return get(`/visitors${buildQuery({ page, size, status })}`);
  },

  getById(id) {
    return get(`/visitors/${id}`);
  },

  create(payload) {
    return post(`/visitors`, payload);
  },

  update(id, payload) {
    return apiPut(`/visitors/${id}`, payload);
  },

  /** Marks a visitor as CHECKED_OUT and stamps the checkout time server-side. */
  checkout(id) {
    return apiPut(`/visitors/${id}/checkout`, {});
  },

  remove(id) {
    return del(`/visitors/${id}`);
  },
};

export default visitorService;
