// Fees page — F7 of the frontend modernisation roadmap.
//
// Live fee records from /api/fees with server pagination, server sort, real
// CRUD, and a one-click "Mark paid" action that hits the backend partial-
// update path. Status filter chips re-query the server (sort of — see below).
//
// Stats strip
//   * Total revenue   — derived from current page (clearly labelled)
//   * Pending amount  — derived from current page
//   * Overdue amount  — derived from current page
//   * Paid count      — derived from current page
//
// Future improvement: backend doesn't have a `status=PAID` query parameter
// on /api/fees yet, so the status filter falls back to client-side filtering
// of the current page (also clearly labelled). When a `status` query is added
// on the backend, we'll wire it up here.

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext }  from "../context/AuthContext";
import feesService  from "../features/fees/feesService";
import FeesTable    from "../features/fees/components/FeesTable";
import PaymentForm  from "../features/fees/components/PaymentForm";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const STATUSES          = ["ALL", "PENDING", "OVERDUE", "PAID", "PARTIAL"];

export default function Fees() {
  const { t } = useContext(ThemeContext);
  const { user } = useContext(AuthContext) ?? {};
  const role = user?.role;
  const canEdit   = role === "admin" || role === "warden";
  const canDelete = role === "admin";

  // ─── query state ────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState({ field: "dueDate", direction: "desc" });
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      const result = await feesService.list({ page, size, sort });
      if (myId !== reqIdRef.current) return;
      setData(result);
    } catch (err) {
      if (myId !== reqIdRef.current) return;
      setError(err);
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, [page, size, sort]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [statusFilter]);

  // ─── modal + delete state ──────────────────────────────────────────────
  const [formOpen,  setFormOpen]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [formError, setFormError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  function handleAdd() {
    if (!canEdit) return;
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }
  function handleEdit(fee) {
    setEditing(fee);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(payload) {
    setFormError(null);
    try {
      if (editing?.id) await feesService.update(editing.id, payload);
      else             await feesService.create(payload);
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(err);
      throw err;
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await feesService.remove(confirmDelete.id);
      setConfirmDelete(null);
      if (data.items.length === 1 && page > 0) setPage(page - 1);
      else                                     await load();
    } catch (err) {
      setConfirmDelete(prev => prev ? { ...prev, _error: err?.message || "Failed to delete." } : null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleMarkPaid(fee) {
    try {
      await feesService.markPaid(fee.id);
      await load();
    } catch (err) {
      setError(err);
    }
  }

  function handleSortChange(field) {
    setSort(prev => prev.field !== field
      ? { field, direction: "asc" }
      : { field, direction: prev.direction === "asc" ? "desc" : "asc" });
    setPage(0);
  }

  // ─── derived view (client-side status filter on current page) ──────────
  const visible = useMemo(() => (
    statusFilter === "ALL"
      ? data.items
      : data.items.filter(f => (f.paymentStatus || "").toUpperCase() === statusFilter)
  ), [data.items, statusFilter]);

  const stats = useMemo(() => computeStats(data.items), [data.items]);

  // ─── render ─────────────────────────────────────────────────────────────
  const showFrom = data.total === 0 ? 0 : page * size + 1;
  const showTo   = Math.min(data.total, page * size + data.items.length);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: t.text }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 20, flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>Fees</h1>
          <p style={{ fontSize: 13, color: t.muted, margin: "4px 0 0" }}>
            Track payments, dues, and revenue.
            {data.total > 0 && (
              <> Showing <strong style={{ color: t.text }}>{showFrom}–{showTo}</strong> of <strong style={{ color: t.text }}>{data.total}</strong>.</>
            )}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={handleAdd}
            style={{
              padding: "10px 16px", borderRadius: 10,
              border: "none", background: t.accent, color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
              boxShadow: `0 4px 12px ${t.accent}33`,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
            Add fee record
          </button>
        )}
      </div>

      {/* ─── Stats strip (current page) ──────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 12,
        marginBottom: 18,
      }}>
        <StatTile t={t} label="Collected"  value={formatINR(stats.paidAmount)}    color={t.success} hint="(this page)" />
        <StatTile t={t} label="Pending"    value={formatINR(stats.pendingAmount)} color={t.warning} hint="(this page)" />
        <StatTile t={t} label="Overdue"    value={formatINR(stats.overdueAmount)} color={t.danger}  hint="(this page)" />
        <StatTile t={t} label="Paid count" value={stats.paidCount}                color={t.accent}  hint="(this page)" />
      </div>

      {/* ─── Status filter chips + page size ─────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {STATUSES.map(s => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "6px 14px", borderRadius: 999,
                border: `1px solid ${active ? t.accent : t.border}`,
                background: active ? t.accent : t.surface,
                color: active ? "#fff" : t.text,
                fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {s === "ALL" ? "All" : labelEnum(s)}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <select
          value={size}
          onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
          style={{
            padding: "8px 12px", borderRadius: 8,
            border: `1px solid ${t.border}`, background: t.surface,
            color: t.text, fontSize: 12, cursor: "pointer",
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
        <EmptyState t={t} canAdd={canEdit} onAdd={handleAdd} />
      ) : visible.length === 0 ? (
        <FilterEmptyState t={t} status={statusFilter} onClear={() => setStatusFilter("ALL")} />
      ) : (
        <>
          <FeesTable
            fees={visible}
            sort={sort}
            onSortChange={handleSortChange}
            onEdit={canEdit   ? handleEdit         : undefined}
            onDelete={canDelete ? setConfirmDelete : undefined}
            onMarkPaid={canEdit ? handleMarkPaid   : undefined}
          />
          {data.totalPages > 1 && (
            <Pagination t={t} page={page} totalPages={data.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* ─── Add / edit modal ────────────────────────────────────────────── */}
      {formOpen && (
        <Modal
          t={t}
          title={editing ? `Edit fee record — ${editing.studentName || "Student #" + editing.studentId}` : "Add a new fee record"}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          width={680}
        >
          <PaymentForm
            fee={editing}
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
          title="Delete fee record?"
          onClose={() => !deleting && setConfirmDelete(null)}
          width={420}
        >
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6, margin: 0 }}>
            This will permanently delete the <strong>{formatINR(confirmDelete.amount)}</strong>{" "}
            fee record for <strong>{confirmDelete.studentName || `Student #${confirmDelete.studentId}`}</strong>.
            This action cannot be undone.
          </p>
          {confirmDelete._error && (
            <div role="alert" style={{
              marginTop: 14, padding: "8px 12px",
              background: `${t.danger}1a`,
              border: `1px solid ${t.danger}55`,
              borderRadius: 8,
              color: t.danger, fontSize: 13,
            }}>
              {confirmDelete._error}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button
              type="button" onClick={() => setConfirmDelete(null)} disabled={deleting}
              style={{
                padding: "8px 14px", borderRadius: 8,
                border: `1px solid ${t.border}`, background: t.surface,
                color: t.text, fontSize: 13, fontWeight: 600,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >Cancel</button>
            <button
              type="button" onClick={handleConfirmDelete} disabled={deleting}
              style={{
                padding: "8px 14px", borderRadius: 8,
                border: "none", background: t.danger, color: "#fff",
                fontSize: 13, fontWeight: 600,
                cursor: deleting ? "wait" : "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {deleting && <Spinner />}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
          <style>{`@keyframes hms-spin { to { transform: rotate(360deg); } }`}</style>
        </Modal>
      )}
    </div>
  );
}

// ─── subcomponents ──────────────────────────────────────────────────────────

function StatTile({ t, label, value, color, hint }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 14,
    }}>
      <div style={{ fontSize: 10, color: t.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{
        fontSize: 20, fontWeight: 800, color,
        marginTop: 4, lineHeight: 1.1,
        fontVariantNumeric: "tabular-nums",
        wordBreak: "break-word",
      }}>
        {value ?? 0}
      </div>
      {hint && <div style={{ fontSize: 10, color: t.muted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

function Pagination({ t, page, totalPages, onPageChange }) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);
  const btnBase = {
    minWidth: 32, height: 32, borderRadius: 8,
    border: `1px solid ${t.border}`, background: t.surface, color: t.text,
    fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "0 10px",
  };
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <button
        type="button" disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        style={{ ...btnBase, opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? "not-allowed" : "pointer" }}
      >← Prev</button>
      {pages.map((p, i) => p === "…" ? (
        <span key={`gap-${i}`} style={{ ...btnBase, border: "none", background: "transparent", cursor: "default" }}>…</span>
      ) : (
        <button
          key={p} type="button"
          onClick={() => onPageChange(p)}
          style={{
            ...btnBase,
            background: p === page ? t.accent : t.surface,
            color:      p === page ? "#fff"   : t.text,
            borderColor: p === page ? t.accent : t.border,
          }}
        >{p + 1}</button>
      ))}
      <button
        type="button" disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        style={{
          ...btnBase,
          opacity: page >= totalPages - 1 ? 0.4 : 1,
          cursor:  page >= totalPages - 1 ? "not-allowed" : "pointer",
        }}
      >Next →</button>
    </div>
  );
}

function TableSkeleton({ t }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
    }}>
      <style>{`@keyframes hms-shimmer { 0% { opacity: 0.5; } 50% { opacity: 0.85; } 100% { opacity: 0.5; } }`}</style>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          display: "flex", gap: 12, alignItems: "center",
          padding: "14px 16px",
          borderBottom: i === 5 ? "none" : `1px solid ${t.border}`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: t.border, animation: "hms-shimmer 1.4s ease-in-out infinite",
          }} />
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px", gap: 12 }}>
            {[80, 60, 50, 60, 50].map((w, j) => (
              <div key={j} style={{
                height: 12, width: `${w}%`, borderRadius: 4,
                background: t.border, animation: "hms-shimmer 1.4s ease-in-out infinite",
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ t, error, onRetry }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 28, textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: `${t.danger}1a`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 12,
      }}>⚠️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>Could not load fee records</h3>
      <p style={{ fontSize: 13, color: t.muted, marginTop: 6, marginBottom: 14 }}>
        {error?.message || "Something went wrong while talking to the server."}
      </p>
      <button
        type="button" onClick={onRetry}
        style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: t.accent, color: "#fff",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >Try again</button>
    </div>
  );
}

function EmptyState({ t, canAdd, onAdd }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 36, textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: `${t.accent}1a`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 12,
      }}>💰</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>No fee records yet</h3>
      <p style={{ fontSize: 13, color: t.muted, marginTop: 6, marginBottom: 14, maxWidth: 360, marginInline: "auto" }}>
        Add a fee record to start tracking payments and dues.
      </p>
      {canAdd && (
        <button
          type="button" onClick={onAdd}
          style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: t.accent, color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >＋ Add fee record</button>
      )}
    </div>
  );
}

function FilterEmptyState({ t, status, onClear }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 28, textAlign: "center",
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: t.text }}>
        No <strong>{labelEnum(status).toLowerCase()}</strong> records on this page
      </h3>
      <p style={{ fontSize: 13, color: t.muted, marginTop: 6, marginBottom: 14 }}>
        Try clearing the filter or moving to another page.
      </p>
      <button
        type="button" onClick={onClear}
        style={{
          padding: "8px 16px", borderRadius: 8,
          border: `1px solid ${t.border}`, background: t.surface,
          color: t.text,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >Show all</button>
    </div>
  );
}

function Modal({ t, title, children, onClose, width = 600 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal="true" aria-label={title}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "5vh 16px", zIndex: 100,
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
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 14,
        width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        animation: "hms-modal-in 0.22s ease",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>{title}</h2>
          <button
            type="button" aria-label="Close dialog" onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: "transparent", color: t.muted, fontSize: 18,
              cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 12, height: 12,
      border: "2px solid rgba(255,255,255,0.4)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "hms-spin 0.7s linear infinite",
    }} />
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function computeStats(items) {
  const stats = {
    paidAmount: 0, pendingAmount: 0, overdueAmount: 0, partialAmount: 0,
    paidCount:  0, pendingCount: 0, overdueCount: 0, partialCount: 0,
  };
  for (const f of items) {
    const amt = Number(f.amount) || 0;
    const s   = (f.paymentStatus || "").toUpperCase();
    if (s === "PAID")    { stats.paidAmount    += amt; stats.paidCount++;    }
    if (s === "PENDING") { stats.pendingAmount += amt; stats.pendingCount++; }
    if (s === "OVERDUE") { stats.overdueAmount += amt; stats.overdueCount++; }
    if (s === "PARTIAL") { stats.partialAmount += amt; stats.partialCount++; }
  }
  return stats;
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const out = [0];
  if (current > 2) out.push("…");
  for (let p = Math.max(1, current - 1); p <= Math.min(total - 2, current + 1); p++) out.push(p);
  if (current < total - 3) out.push("…");
  out.push(total - 1);
  return out;
}

function formatINR(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function labelEnum(value) {
  if (!value) return "";
  return value.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}
