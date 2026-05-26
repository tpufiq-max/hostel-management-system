import { get, post, put as apiPut, del } from "../../api/api";

/**
 * Student API client.
 *
 * Backend endpoints (see backend/src/main/java/com/hostel/controller/StudentController.java):
 *   GET    /api/students[?page=0&size=10]
 *   GET    /api/students/{id}
 *   GET    /api/students/search?query=foo
 *   POST   /api/students
 *   PUT    /api/students/{id}
 *   DELETE /api/students/{id}
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

export const studentService = {
  list({ page = 0, size = 20 } = {}) {
    return get(`/students${buildQuery({ page, size })}`);
  },

  search({ query, page = 0, size = 20 }) {
    return get(`/students/search${buildQuery({ query, page, size })}`);
  },

  getById(id) {
    return get(`/students/${id}`);
  },

  create(payload) {
    return post(`/students`, payload);
  },

  update(id, payload) {
    return apiPut(`/students/${id}`, payload);
  },

  remove(id) {
    return del(`/students/${id}`);
  },
};

export default studentService;
