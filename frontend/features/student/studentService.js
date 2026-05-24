// Student service — talks to /api/students.
//
// Backend exposes Spring Data Pageable so list/search returns:
//   {
//     content:       StudentDTO[],
//     totalElements: number,
//     totalPages:    number,
//     number:        number,   // current page (0-based)
//     size:          number,
//     first/last:    boolean,
//     ...
//   }
//
// All methods normalise the response into a clean shape:
//   { items, total, totalPages, page, size }
//
// The api response interceptor sometimes auto-unwraps the envelope
// (`response.data`) and sometimes hands it through whole. `unwrap()` handles
// both shapes so this service is resilient either way.

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

/**
 * GET /api/students?page=&size=&sort=
 */
export async function listStudents(opts = {}) {
  const qs = buildPageQuery(opts);
  const res = await get(`/students?${qs}`);
  return normalisePage(unwrap(res));
}

/**
 * GET /api/students/search?query=&page=&size=&sort=
 * If `query` is empty/falsy, falls back to listStudents.
 */
export async function searchStudents({ query, ...opts } = {}) {
  const trimmed = (query ?? "").trim();
  if (!trimmed) return listStudents(opts);

  const params = new URLSearchParams(buildPageQuery(opts));
  params.append("query", trimmed);
  const res = await get(`/students/search?${params.toString()}`);
  return normalisePage(unwrap(res));
}

/** GET /api/students/{id} */
export async function getStudent(id) {
  const res = await get(`/students/${id}`);
  return unwrap(res);
}

/** POST /api/students */
export async function createStudent(payload) {
  const res = await post(`/students`, payload);
  return unwrap(res);
}

/** PUT /api/students/{id} */
export async function updateStudent(id, payload) {
  const res = await apiPut(`/students/${id}`, payload);
  return unwrap(res);
}

/** DELETE /api/students/{id} */
export async function deleteStudent(id) {
  const res = await del(`/students/${id}`);
  return unwrap(res);
}

const studentService = {
  list:   listStudents,
  search: searchStudents,
  get:    getStudent,
  create: createStudent,
  update: updateStudent,
  remove: deleteStudent,
};

export default studentService;
