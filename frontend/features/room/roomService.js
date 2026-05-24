// Room service — talks to /api/rooms.
//
// Endpoints
//   GET    /rooms?page=&size=&sort=   (Spring Pageable)
//   GET    /rooms/{id}
//   GET    /rooms/available           (non-paginated list of AVAILABLE rooms)
//   POST   /rooms                     (admin)
//   PUT    /rooms/{id}                (admin)
//   DELETE /rooms/{id}                (admin)
//
// Like studentService, this defensively unwraps the response envelope so it
// works whether the api layer auto-unwraps or returns it whole.

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

function buildPageQuery({ page = 0, size = 12, sort } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (sort && sort.field) {
    params.append("sort", `${sort.field},${sort.direction === "desc" ? "desc" : "asc"}`);
  }
  return params.toString();
}

/** GET /api/rooms */
export async function listRooms(opts = {}) {
  const qs = buildPageQuery(opts);
  return normalisePage(unwrap(await get(`/rooms?${qs}`)));
}

/** GET /api/rooms/{id} */
export async function getRoom(id) {
  return unwrap(await get(`/rooms/${id}`));
}

/** GET /api/rooms/available — returns a flat list (not paginated) */
export async function listAvailableRooms() {
  const res = unwrap(await get(`/rooms/available`));
  return Array.isArray(res) ? res : [];
}

/** POST /api/rooms */
export async function createRoom(payload) {
  return unwrap(await post(`/rooms`, payload));
}

/** PUT /api/rooms/{id} */
export async function updateRoom(id, payload) {
  return unwrap(await apiPut(`/rooms/${id}`, payload));
}

/** DELETE /api/rooms/{id} */
export async function deleteRoom(id) {
  return unwrap(await del(`/rooms/${id}`));
}

const roomService = {
  list:      listRooms,
  get:       getRoom,
  available: listAvailableRooms,
  create:    createRoom,
  update:    updateRoom,
  remove:    deleteRoom,
};

export default roomService;
