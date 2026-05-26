import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Mess menu API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/MessMenuController.java):
 *   GET    /api/mess[?day=MON&mealType=LUNCH&page=0&size=30]
 *   GET    /api/mess/{id}
 *   POST   /api/mess
 *   PUT    /api/mess/{id}
 *   DELETE /api/mess/{id}
 *
 * The backend has a UNIQUE constraint on (day, meal_type), so creating a
 * second menu for the same slot returns a BadRequest with a clear message
 * — surface that error directly to the user.
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

export const messService = {
  /**
   * @param {{page?: number, size?: number, day?: string, mealType?: string}} [opts]
   */
  list({ page = 0, size = 50, day, mealType } = {}) {
    return get(`/mess${buildQuery({ page, size, day, mealType })}`);
  },

  getById(id) {
    return get(`/mess/${id}`);
  },

  create(payload) {
    return post(`/mess`, payload);
  },

  update(id, payload) {
    return apiPut(`/mess/${id}`, payload);
  },

  remove(id) {
    return del(`/mess/${id}`);
  },
};

export default messService;
