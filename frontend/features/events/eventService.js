// Event service — talks to /api/events.
//
// Endpoints
//   GET    /events?page=&size=&status=&startDate=&endDate=
//   GET    /events/{id}
//   POST   /events
//   PUT    /events/{id}
//   DELETE /events/{id}

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

/** GET /api/events */
export async function listEvents({ page = 0, size = 50, status, startDate, endDate } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (status) params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const res = await get(`/events?${params.toString()}`);
  return normalisePage(unwrap(res));
}

/** GET /api/events/{id} */
export async function getEvent(id) {
  const res = await get(`/events/${id}`);
  return unwrap(res);
}

/** POST /api/events */
export async function createEvent(payload) {
  const res = await post(`/events`, payload);
  return unwrap(res);
}

/** PUT /api/events/{id} */
export async function updateEvent(id, payload) {
  const res = await apiPut(`/events/${id}`, payload);
  return unwrap(res);
}

/** DELETE /api/events/{id} */
export async function removeEvent(id) {
  const res = await del(`/events/${id}`);
  return unwrap(res);
}

const eventService = {
  list:   listEvents,
  get:    getEvent,
  create: createEvent,
  update: updateEvent,
  remove: removeEvent,
};

export default eventService;
