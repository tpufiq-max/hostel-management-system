// Mess service — talks to /api/mess.
//
// Endpoints
//   GET    /mess?page=&size=&day=&mealType=  (Spring Pageable + filters)
//   GET    /mess/{id}
//   POST   /mess
//   PUT    /mess/{id}
//   DELETE /mess/{id}

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

/** GET /api/mess */
export async function listMeals({ page = 0, size = 20, day, mealType } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (day) params.append("day", day);
  if (mealType) params.append("mealType", mealType);
  const res = await get(`/mess?${params.toString()}`);
  return normalisePage(unwrap(res));
}

/** GET /api/mess/{id} */
export async function getMeal(id) {
  const res = await get(`/mess/${id}`);
  return unwrap(res);
}

/** POST /api/mess */
export async function createMeal(payload) {
  const res = await post(`/mess`, payload);
  return unwrap(res);
}

/** PUT /api/mess/{id} */
export async function updateMeal(id, payload) {
  const res = await apiPut(`/mess/${id}`, payload);
  return unwrap(res);
}

/** DELETE /api/mess/{id} */
export async function removeMeal(id) {
  const res = await del(`/mess/${id}`);
  return unwrap(res);
}

const messService = {
  list:   listMeals,
  get:    getMeal,
  create: createMeal,
  update: updateMeal,
  remove: removeMeal,
};

export default messService;
