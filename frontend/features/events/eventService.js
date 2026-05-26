import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Event API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/EventController.java):
 *   GET    /api/events[?status=UPCOMING&category=CULTURAL&page=0&size=20]
 *   GET    /api/events/range?from=2026-05-01&to=2026-05-31     (calendar view)
 *   GET    /api/events/{id}
 *   POST   /api/events
 *   PUT    /api/events/{id}
 *   DELETE /api/events/{id}
 *
 * Date format: yyyy-MM-dd
 * Time format: HH:mm or HH:mm:ss
 *
 * The shared response interceptor unwraps the {success, data, message}
 * envelope so callers receive the inner DTO/Page or List directly.
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const eventService = {
  /**
   * @param {{page?: number, size?: number, status?: string, category?: string}} [opts]
   */
  list({ page = 0, size = 20, status, category } = {}) {
    return get(`/events${buildQuery({ page, size, status, category })}`);
  },

  /**
   * Calendar view: all events whose eventDate falls between from and to (inclusive).
   * @param {string} from yyyy-MM-dd
   * @param {string} to   yyyy-MM-dd
   * @returns {Promise<EventDTO[]>}
   */
  listInRange(from, to) {
    return get(`/events/range${buildQuery({ from, to })}`);
  },

  getById(id) {
    return get(`/events/${id}`);
  },

  create(payload) {
    return post(`/events`, payload);
  },

  update(id, payload) {
    return apiPut(`/events/${id}`, payload);
  },

  remove(id) {
    return del(`/events/${id}`);
  },
};

export default eventService;
