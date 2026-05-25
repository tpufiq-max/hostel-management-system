// Fees service — talks to /api/fees.
//
// Endpoints
//   GET    /fees?page=&size=&sort=        (Spring Pageable)
//   GET    /fees/{id}
//   GET    /fees/student/{studentId}      (non-paginated)
//   POST   /fees                          (admin / warden)
//   PUT    /fees/{id}                     (admin / warden)
//   DELETE /fees/{id}                     (admin)
//
// Like the other services, defensively unwraps the response envelope so it
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

function buildPageQuery({ page = 0, size = 10, sort } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (sort && sort.field) {
    params.append("sort", `${sort.field},${sort.direction === "desc" ? "desc" : "asc"}`);
  }
  return params.toString();
}

/** GET /api/fees */
export async function listFees(opts = {}) {
  return normalisePage(unwrap(await get(`/fees?${buildPageQuery(opts)}`)));
}

/** GET /api/fees/{id} */
export async function getFee(id) {
  return unwrap(await get(`/fees/${id}`));
}

/** GET /api/fees/student/{studentId} — non-paginated fee history */
export async function listStudentFees(studentId) {
  const res = unwrap(await get(`/fees/student/${studentId}`));
  return Array.isArray(res) ? res : [];
}

/** POST /api/fees */
export async function createFee(payload) {
  return unwrap(await post(`/fees`, payload));
}

/** PUT /api/fees/{id} */
export async function updateFee(id, payload) {
  return unwrap(await apiPut(`/fees/${id}`, payload));
}

/** DELETE /api/fees/{id} */
export async function deleteFee(id) {
  return unwrap(await del(`/fees/${id}`));
}

/**
 * Quick action: mark a fee as PAID with today's date.
 * Backend update is partial-friendly (NullValuePropertyMappingStrategy.IGNORE),
 * so we only send the two fields we want to change.
 */
export async function markFeePaid(id, { paymentMethod, transactionId } = {}) {
  return updateFee(id, {
    paymentStatus: "PAID",
    paymentDate:   new Date().toISOString().slice(0, 10),
    ...(paymentMethod  ? { paymentMethod }  : {}),
    ...(transactionId  ? { transactionId } : {}),
  });
}

const feesService = {
  list:         listFees,
  get:          getFee,
  studentFees:  listStudentFees,
  create:       createFee,
  update:       updateFee,
  remove:       deleteFee,
  markPaid:     markFeePaid,
};

export default feesService;
