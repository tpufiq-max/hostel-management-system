// Visitor service — talks to /api/visitors.
//
// Endpoints
//   GET    /visitors?page=&size=&status=
//   GET    /visitors/{id}
//   POST   /visitors
//   PUT    /visitors/{id}
//   PUT    /visitors/{id}/checkout
//   DELETE /visitors/{id}

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

/** GET /api/visitors */
export async function listVisitors({ page = 0, size = 20, status } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (status) params.append("status", status);
  const res = await get(`/visitors?${params.toString()}`);
  return normalisePage(unwrap(res));
}

/** GET /api/visitors/{id} */
export async function getVisitor(id) {
  const res = await get(`/visitors/${id}`);
  return unwrap(res);
}

/** POST /api/visitors */
export async function createVisitor(payload) {
  const res = await post(`/visitors`, payload);
  return unwrap(res);
}

/** PUT /api/visitors/{id} */
export async function updateVisitor(id, payload) {
  const res = await apiPut(`/visitors/${id}`, payload);
  return unwrap(res);
}

/** PUT /api/visitors/{id}/checkout */
export async function checkoutVisitor(id) {
  const res = await apiPut(`/visitors/${id}/checkout`, {});
  return unwrap(res);
}

/** DELETE /api/visitors/{id} */
export async function removeVisitor(id) {
  const res = await del(`/visitors/${id}`);
  return unwrap(res);
}

const visitorService = {
  list:     listVisitors,
  get:      getVisitor,
  create:   createVisitor,
  update:   updateVisitor,
  checkout: checkoutVisitor,
  remove:   removeVisitor,
};

export default visitorService;
