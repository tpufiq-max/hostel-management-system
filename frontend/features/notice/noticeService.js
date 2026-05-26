import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Notice API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/NoticeController.java):
 *   GET    /api/notices[?category=GENERAL&priority=HIGH&active=true&page=0&size=20]
 *   GET    /api/notices/{id}
 *   POST   /api/notices
 *   PUT    /api/notices/{id}
 *   DELETE /api/notices/{id}
 *
 * The shared response interceptor unwraps the {success, data, message}
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

export const noticeService = {
  /**
   * @param {{page?: number, size?: number, category?: string, priority?: string, active?: boolean}} [opts]
   */
  list({ page = 0, size = 20, category, priority, active } = {}) {
    return get(`/notices${buildQuery({ page, size, category, priority, active })}`);
  },

  getById(id) {
    return get(`/notices/${id}`);
  },

  create(payload) {
    return post(`/notices`, payload);
  },

  update(id, payload) {
    return apiPut(`/notices/${id}`, payload);
  },

  remove(id) {
    return del(`/notices/${id}`);
  },
};

export default noticeService;
