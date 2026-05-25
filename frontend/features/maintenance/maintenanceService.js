// Maintenance service — talks to /api/maintenance.
//
// Endpoints
//   GET    /maintenance?page=&size=&status=&priority=&category=
//   GET    /maintenance/{id}
//   POST   /maintenance
//   PUT    /maintenance/{id}
//   DELETE /maintenance/{id}

import { get, post, put as apiPut, del } from "../../api/api";

function unwrap(res) {
  if (res == null) return null;
  if (typeof res === "object" && "data" in res && "success" in res) {
    return res.data ?? null;
  }
  return res;
}

function normalisePage(page) {
  if (!page) return { items: [], total: 0, totalPages: 0, page: 0, size: 0 };
  return {
    items:      Array.isArray(page.content) ? page.content : [],
    total:      page.totalElements ?? 0,
    totalPages: page.totalPages    ?? 0,
    page:       page.number        ?? 0,
    size:       page.size          ?? 0,
  };
}

/** GET /api/maintenance */
export async function listRequests({ page = 0, size = 20, status, priority, category } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);
  if (category) params.append("category", category);
  const res = await get(`/maintenance?${params.toString()}`);
  return normalisePage(unwrap(res));
}

/** GET /api/maintenance/{id} */
export async function getRequest(id) {
  const res = await get(`/maintenance/${id}`);
  return unwrap(res);
}

/** POST /api/maintenance */
export async function createRequest(payload) {
  const res = await post(`/maintenance`, payload);
  return unwrap(res);
}

/** PUT /api/maintenance/{id} */
export async function updateRequest(id, payload) {
  const res = await apiPut(`/maintenance/${id}`, payload);
  return unwrap(res);
}

/** DELETE /api/maintenance/{id} */
export async function removeRequest(id) {
  const res = await del(`/maintenance/${id}`);
  return unwrap(res);
}

const maintenanceService = {
  list:   listRequests,
  get:    getRequest,
  create: createRequest,
  update: updateRequest,
  remove: removeRequest,
};

export default maintenanceService;
