// Students page — F5 of the frontend modernisation roadmap.
//
// What this page now does (vs. the previous fake CRUD):
//   * Fetches students from the real backend at GET /api/students (paginated,
//     server-side sortable). 5 hard-coded sample rows are gone.
//   * Server-side search via /api/students/search?query= with a 300 ms debounce
//     so we don't hammer the API on every keystroke.
//   * Page size + page number controlled here, sent to the backend.
//   * Add / Edit submit through StudentForm to POST or PUT respectively.
//   * Delete shows a confirmation modal and calls DELETE /api/students/{id}.
//   * Loading, error, and empty states are explicit rather than a single
//     spinner-or-fake-data dichotomy.
//
// State management is intentionally local (useState) — no global store needed
// for one page; we'll move to a shared cache when more pages need it.

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext }  from "../context/AuthContext";
import studentService from "../features/student/studentService";
import StudentTable  from "../features/student/components/StudentTable";
import StudentForm   from "../features/student/components/StudentForm";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Students() {
  const { t } = useContext(ThemeContext);
  const { user } = useContext(AuthContext) ?? {};
  const role = user?.role;
  const canEdit   = role === "admin" || role === "warden";
  const canDelete = role === "admin";

  // ─── server-driven query state ──────────────────────────────────────────
  const [page, setPage]         = useState(0);
  const [size, setSize]         = useState(10);
  const [sort, setSort]         = useState({ field: "name", direction: "asc" });
  const [searchInput, setSearchInput] = useState("");
  const [debounced,  setDebounced]    = useState("");

  // Debounce search → debounced
  useEffect(() => {
    const id = setTimeout(() => setDebounced(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);
  // When the search term changes, jump back to page 0
  useEffect(() => { setPage(0); }, [debounced]);

  // ─── data state ─────────────────────────────────────────────────────────
  const [data, setData]       = useState({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reqIdRef = useRef(0);

  const load = useCallback(async () => {
    const myId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.search({
        query: debounced,
        page,
        size,
        sort,
      });
      // Ignore stale responses (e.g. user typed faster than the network).
      if (myId !== reqIdRef.current) return;
      setData(result);
    } catch (err) {
      if (myId !== reqIdRef.current) return;
      setError(err);
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, [debounced, page, size, sort]);

  useEffect(() => { load(); }, [load]);

  // ─── modal state ────────────────────────────────────────────────────────
  const [formOpen, setFormOpen]         = useState(false);
  const [editing, setEditing]           = useState(null);
  const [formError, setFormError]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // student object
  const [deleting, setDeleting]         = useState(false);

  function handleAdd() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function handleEdit(student) {
    setEditing(student);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(payload) {
    setFormError(null);
    try {
      if (editing?.id) {
        await studentService.update(editing.id, payload);
      } else {
        await studentService.create(payload);
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(err);
      // Re-throw so the form's submitting state resets correctly
      throw err;
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await studentService.remove(confirmDelete.id);
      setConfirmDelete(null);
      // If we just deleted the last row on this page, step back one page
      if (data.items.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await load();
      }
    } catch (err) {
      // Surface error inline at the bottom of the dialog
      setConfirmDelete(prev => prev ? { ...prev, _error: err?.message || "Failed to delete." } : null);
    } finally {
      setDeleting(false);
    }
  }

  function handleSortChange(field) {
    setSort(prev => {
      if (prev.field !== field) return { field, direction: "asc" };
      return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
    setPage(0);
  }

  // ─── helpers ────────────────────────────────────────────────────────────
  const showFrom = data.total === 0 ? 0 : page * size + 1;
  const showTo   = Math.min(data.total, page * size + data.items.length);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: t.text }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>Students</h1>
          <p style={{ fontSize: 13, color: t.muted, margin: "4px 0 0" }}>
            Manage student records and hostel allocation. {data.total > 0 && (
              <span>Showing <strong style={{ color: t.text }}>{showFrom}–{showTo}</strong> of <strong style={{ color: t.text }}>{data.total}</strong>.</span>
            )}
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleAdd}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: t.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 4px 12px ${t.accent}33`,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
            Add student
          </button>
        )}
      </div>

      {/* ─── Search + page-size ──────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 14,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <span style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: t.muted,
            pointerEvents: "none",
            fontSize: 13,
          }}>🔍</span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or roll number…"
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.surface,
              color: t.text,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        <select
          value={size}
          onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.text,
            fontSize: 13,
            cursor: "pointer",
          }}
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      {/* ─── Body ────────────────────────────────────────────────────────── */}
      {loading && data.items.length === 0 ? (
        <TableSkeleton t={t} />
      ) : error ? (
        <ErrorState t={t} error={error} onRetry={load} />
      ) : data.items.length === 0 ? (
        <EmptyState t={t} hasQuery={Boolean(debounced)} canAdd={canEdit} onAdd={handleAdd} />
      ) : (
        <>
          <StudentTable
            students={data.items}
            sort={sort}
            onSortChange={handleSortChange}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canDelete ? setConfirmDelete : undefined}
          />
          {data.totalPages > 1 && (
            <Pagination
              t={t}
              page={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* ─── Add / edit modal ────────────────────────────────────────────── */}
      {formOpen && (
        <Modal
          t={t}
          title={editing ? `Edit student — ${editing.name}` : "Add a new student"}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          width={760}
        >
          <StudentForm
            student={editing}
            onClose={() => { setFormOpen(false); setEditing(null); }}
            onSubmit={handleSubmit}
            error={formError}
          />
        </Modal>
      )}

      {/* ─── Delete confirmation ─────────────────────────────────────────── */}
      {confirmDelete && (
        <Modal
          t={t}
          title="Delete student?"
          onClose={() => !deleting && setConfirmDelete(null)}
          width={420}
        >
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6, margin: 0 }}>
            This will permanently delete <strong>{confirmDelete.name}</strong> from the system. This action cannot be undone.
          </p>
          {confirmDelete._error && (
            <div role="alert" style={{
              marginTop: 14,
              padding: "8px 12px",
              background: `${t.danger}1a`,
              border: `1px solid ${t.danger}55`,
              borderRadius: 8,
              color: t.danger,
              fontSize: 13,
            }}>
              {confirmDelete._error}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              disabled={deleting}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                fontSize: 13,
                fontWeight: 600,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: t.danger,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: deleting ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {deleting && (
                <span style={{
                  display: "inline-block",
                  width: 12, height: 12,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "hms-spin 0.7s linear infinite",
                }} />
              )}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
          <style>{`@keyframes hms-spin { to { transform: rotate(360deg); } }`}</style>
        </Modal>
      )}
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function Pagination({ t, page, totalPages, onPageChange }) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  const btnBase = {
    minWidth:     32,
    height:       32,
    borderRadius: 8,
    border:       `1px solid ${t.border}`,
    background:   t.surface,
    color:        t.text,
    fontSize:     12,
    fontWeight:   600,
    cursor:       "pointer",
    padding:      "0 10px",
  };

  return (
    <div style={{
      display: "flex",
      gap: 6,
      marginTop: 14,
      flexWrap: "wrap",
      justifyContent: "flex-end",
    }}>
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        style={{ ...btnBase, opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? "not-allowed" : "pointer" }}
      >
        ← Prev
      </button>
      {pages.map((p, i) => p === "…" ? (
        <span key={`gap-${i}`} style={{ ...btnBase, border: "none", background: "transparent", cursor: "default" }}>…</span>
      ) : (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          style={{
            ...btnBase,
            background: p === page ? t.accent : t.surface,
            color:      p === page ? "#fff"   : t.text,
            borderColor: p === page ? t.accent : t.border,
          }}
        >
          {p + 1}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        style={{
          ...btnBase,
          opacity: page >= totalPages - 1 ? 0.4 : 1,
          cursor:  page >= totalPages - 1 ? "not-allowed" : "pointer",
        }}
      >
        Next →
      </button>
    </div>
  );
}

/** Compute "1 … 4 5 6 … 12" style page list. */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const out = [0];
  if (current > 2) out.push("…");
  for (let p = Math.max(1, current - 1); p <= Math.min(total - 2, current + 1); p++) {
    out.push(p);
  }
  if (current < total - 3) out.push("…");
  out.push(total - 1);
  return out;
}

function TableSkeleton({ t }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <style>{`@keyframes hms-shimmer { 0% { opacity: 0.5; } 50% { opacity: 0.85; } 100% { opacity: 0.5; } }`}</style>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: i === 5 ? "none" : `1px solid ${t.border}`,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: t.border, animation: "hms-shimmer 1.4s ease-in-out infinite",
          }} />
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 12 }}>
            <div style={{ height: 12, borderRadius: 4, background: t.border, animation: "hms-shimmer 1.4s ease-in-out infinite" }} />
            <div style={{ height: 12, borderRadius: 4, background: t.border, animation: "hms-shimmer 1.4s ease-in-out infinite" }} />
            <div style={{ height: 12, borderRadius: 4, background: t.border, animation: "hms-shimmer 1.4s ease-in-out infinite" }} />
            <div style={{ height: 12, borderRadius: 4, background: t.border, animation: "hms-shimmer 1.4s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ t, error, onRetry }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: 28,
      textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: `${t.danger}1a`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 12,
      }}>⚠️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>Could not load students</h3>
      <p style={{ fontSize: 13, color: t.muted, marginTop: 6, marginBottom: 14 }}>
        {error?.message || "Something went wrong while talking to the server."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          background: t.accent,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ t, hasQuery, canAdd, onAdd }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: 36,
      textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: `${t.accent}1a`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 12,
      }}>👥</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>
        {hasQuery ? "No students match your search" : "No students yet"}
      </h3>
      <p style={{ fontSize: 13, color: t.muted, marginTop: 6, marginBottom: 14, maxWidth: 360, marginInline: "auto" }}>
        {hasQuery
          ? "Try a different search term or clear the search to see all students."
          : "Add your first student to start managing the hostel."}
      </p>
      {!hasQuery && canAdd && (
        <button
          type="button"
          onClick={onAdd}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: t.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ＋ Add student
        </button>
      )}
    </div>
  );
}

function Modal({ t, title, children, onClose, width = 600 }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset:    0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "5vh 16px",
        zIndex: 100,
        backdropFilter: "blur(2px)",
        animation: "hms-fade-in 0.18s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <style>{`
        @keyframes hms-fade-in   { from { opacity: 0; }                        to { opacity: 1; } }
        @keyframes hms-modal-in  { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{
        background:   t.surface,
        border:       `1px solid ${t.border}`,
        borderRadius: 14,
        width:        "100%",
        maxWidth:     width,
        maxHeight:    "90vh",
        overflow:     "auto",
        boxShadow:    "0 24px 60px rgba(0,0,0,0.35)",
        animation:    "hms-modal-in 0.22s ease",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: `1px solid ${t.border}`,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>{title}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: "none", background: "transparent",
              color: t.muted, fontSize: 18, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 20 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
