// Notice service — talks to /api/notices.
//
// Endpoints
//   GET    /notices?page=&size=&category=&active=
//   GET    /notices/{id}
//   POST   /notices
//   PUT    /notices/{id}
//   DELETE /notices/{id}

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

/** GET /api/notices */
export async function listNotices({ page = 0, size = 20, category, active } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (category) params.append("category", category);
  if (active !== undefined && active !== null) params.append("active", String(active));
  const res = await get(`/notices?${params.toString()}`);
  return normalisePage(unwrap(res));
}

/** GET /api/notices/{id} */
export async function getNotice(id) {
  const res = await get(`/notices/${id}`);
  return unwrap(res);
}

/** POST /api/notices */
export async function createNotice(payload) {
  const res = await post(`/notices`, payload);
  return unwrap(res);
}

/** PUT /api/notices/{id} */
export async function updateNotice(id, payload) {
  const res = await apiPut(`/notices/${id}`, payload);
  return unwrap(res);
}

/** DELETE /api/notices/{id} */
export async function removeNotice(id) {
  const res = await del(`/notices/${id}`);
  return unwrap(res);
}

const noticeService = {
  list:   listNotices,
  get:    getNotice,
  create: createNotice,
  update: updateNotice,
  remove: removeNotice,
};

export default noticeService;
