// Allocation service — talks to /api/allocations.
//
// Endpoints
//   GET    /allocations?page=&size=&sort=   (Spring Pageable)
//   GET    /allocations/{id}
//   POST   /allocations                     (admin / warden)
//   PUT    /allocations/{id}                (admin / warden)
//   DELETE /allocations/{id}                (admin)
//
// Defensively unwraps the response envelope so it works whether the api layer
// auto-unwraps or returns it whole.

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

function buildPageQuery({ page = 0, size = 10, sort } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (sort && sort.field) {
    params.append("sort", `${sort.field},${sort.direction === "desc" ? "desc" : "asc"}`);
  }
  return params.toString();
}

/** GET /api/allocations */
export async function listAllocations(opts = {}) {
  return normalisePage(unwrap(await get(`/allocations?${buildPageQuery(opts)}`)));
}

/** GET /api/allocations/{id} */
export async function getAllocation(id) {
  return unwrap(await get(`/allocations/${id}`));
}

/** POST /api/allocations */
export async function createAllocation(payload) {
  return unwrap(await post(`/allocations`, payload));
}

/** PUT /api/allocations/{id} */
export async function updateAllocation(id, payload) {
  return unwrap(await apiPut(`/allocations/${id}`, payload));
}

/** DELETE /api/allocations/{id} */
export async function deleteAllocation(id) {
  return unwrap(await del(`/allocations/${id}`));
}

const allocationService = {
  list:   listAllocations,
  get:    getAllocation,
  create: createAllocation,
  update: updateAllocation,
  remove: deleteAllocation,
};

export default allocationService;
