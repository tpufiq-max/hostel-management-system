import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Room API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/RoomController.java):
 *   GET    /api/rooms[?page=0&size=10]
 *   GET    /api/rooms/{id}
 *   GET    /api/rooms/available
 *   POST   /api/rooms
 *   PUT    /api/rooms/{id}
 *   DELETE /api/rooms/{id}
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const roomService = {
  list({ page = 0, size = 20 } = {}) {
    return get(`/rooms${buildQuery({ page, size })}`);
  },

  available() {
    return get(`/rooms/available`);
  },

  getById(id) {
    return get(`/rooms/${id}`);
  },

  create(payload) {
    return post(`/rooms`, payload);
  },

  update(id, payload) {
    return apiPut(`/rooms/${id}`, payload);
  },

  remove(id) {
    return del(`/rooms/${id}`);
  },
};

export default roomService;
