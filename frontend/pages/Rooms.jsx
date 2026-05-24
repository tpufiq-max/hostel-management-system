// Rooms page — F6 of the frontend modernisation roadmap.
//
// Live data from /api/rooms with server pagination, real CRUD, stats, and a
// status filter that flips between paginated /rooms and the non-paginated
// /rooms/available endpoint depending on what the user picked.
//
// Card-grid layout because rooms are small, status-rich entities — easier to
// scan visually than a wide table.

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext }  from "../context/AuthContext";
import roomService from "../features/room/roomService";
import RoomForm    from "../features/room/components/RoomForm";

const PAGE_SIZE = 12;
const STATUSES  = ["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"];

export default function Rooms() {
  const { t } = useContext(ThemeContext);
  const { user } = useContext(AuthContext) ?? {};
  const role = user?.role;
  const canEdit   = role === "admin";
  const canDelete = role === "admin";

  // ─── query state ────────────────────────────────────────────────────────
  const [page, setPage]               = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort]               = useState({ field: "roomNumber", direction: "asc" });

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
      let result;
      if (statusFilter === "AVAILABLE") {
        // Use the dedicated endpoint — flat list, no pagination on the server.
        const all = await roomService.available();
        result = {
          items:      all,
          total:      all.length,
          totalPages: 1,
          page:       0,
          size:       all.length,
        };
      } else if (statusFilter === "ALL") {
        result = await roomService.list({ page, size: PAGE_SIZE, sort });
      } else {
        // No backend filter for the other statuses today, so we fall back
        // to client-side filtering on the current paginated page.
        const raw = await roomService.list({ page, size: PAGE_SIZE, sort });
        result = {
          ...raw,
          items: raw.items.filter(r => (r.status || "").toUpperCase() === statusFilter),
        };
      }
      if (myId !== reqIdRef.current) return;
      setData(result);
    } catch (err) {
      if (myId !== reqIdRef.current) return;
      setError(err);
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, [statusFilter, page, sort]);

  useEffect(() => { load(); }, [load]);
  // Reset to page 0 when the status filter changes
  useEffect(() => { setPage(0); }, [statusFilter]);

  // ─── modal state ────────────────────────────────────────────────────────
  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [formError, setFormError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  function handleAdd()        { setEditing(null);  setFormError(null); setFormOpen(true); }
  function handleEdit(room)   { setEditing(room);  setFormError(null); setFormOpen(true); }

  async function handleSubmit(payload) {
    setFormError(null);
    try {
      if (editing?.id) await roomService.update(editing.id, payload);
      else             await roomService.create(payload);
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
      await roomService.remove(confirmDelete.id);
      setConfirmDelete(null);
      if (data.items.length === 1 && page > 0) setPage(page - 1);
      else                                      await load();
    } catch (err) {
      setConfirmDelete(prev => prev ? { ...prev, _error: err?.message || "Failed to delete." } : null);
    } finally {
      setDeleting(false);
    }
  }

  // ─── derived stats from current page ────────────────────────────────────
  const stats = useMemo(() => computeStats(data.items), [data.items]);

  // ─── render helpers for empty/error/loading at the body level ───────────
  const showFrom = data.total === 0 ? 0 : page * PAGE_SIZE + 1;
  const showTo   = Math.min(data.total, page * PAGE_SIZE + data.items.length);

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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>Rooms</h1>
          <p style={{ fontSize: 13, color: t.muted, margin: "4px 0 0" }}>
            Manage room inventory and availability.
            {data.total > 0 && statusFilter === "ALL" && (
              <> Showing <strong style={{ color: t.text }}>{showFrom}–{showTo}</strong> of <strong style={{ color: t.text }}>{data.total}</strong>.</>
            )}
            {statusFilter !== "ALL" && (
              <> Filtered by status: <strong style={{ color: t.text }}>{capitalise(statusFilter)}</strong> ({data.items.length}).</>
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
            Add room
          </button>
        )}
      </div>

      {/* ─── Stats strip ─────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        marginBottom: 18,
      }}>
        <StatTile t={t} label="Total"       value={data.total}         color={t.accent}  />
        <StatTile t={t} label="Available"   value={stats.available}    color={t.success} hint="(this page)" />
        <StatTile t={t} label="Occupied"    value={stats.occupied}     color={t.danger}  hint="(this page)" />
        <StatTile t={t} label="Maintenance" value={stats.maintenance}  color={t.warning} hint="(this page)" />
      </div>

      {/* ─── Status filter chips ─────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {STATUSES.map(s => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? t.accent : t.border}`,
                background: active ? t.accent : t.surface,
                color: active ? "#fff" : t.text,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {s === "ALL" ? "All" : capitalise(s)}
            </button>
          );
        })}
      </div>

      {/* ─── Body ────────────────────────────────────────────────────────── */}
      {loading && data.items.length === 0 ? (
        <CardGridSkeleton t={t} />
      ) : error ? (
        <ErrorState t={t} error={error} onRetry={load} />
      ) : data.items.length === 0 ? (
        <EmptyState t={t} statusFilter={statusFilter} canAdd={canEdit} onAdd={handleAdd} />
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}>
            {data.items.map(room => (
              <RoomCard
                key={room.id}
                t={t}
                room={room}
                onEdit={canEdit   ? () => handleEdit(room)   : undefined}
                onDelete={canDelete ? () => setConfirmDelete(room) : undefined}
              />
            ))}
          </div>
          {statusFilter === "ALL" && data.totalPages > 1 && (
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
          title={editing ? `Edit room ${editing.roomNumber}` : "Add a new room"}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          width={620}
        >
          <RoomForm
            room={editing}
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
          title="Delete room?"
          onClose={() => !deleting && setConfirmDelete(null)}
          width={420}
        >
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6, margin: 0 }}>
            This will permanently delete room <strong>{confirmDelete.roomNumber}</strong>. This action cannot be undone.
          </p>
          {confirmDelete.occupied > 0 && (
            <p style={{ fontSize: 13, color: t.warning, margin: "10px 0 0" }}>
              ⚠ This room currently has {confirmDelete.occupied} occupant{confirmDelete.occupied === 1 ? "" : "s"}.
              Reassign them before deleting.
            </p>
          )}
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

function RoomCard({ t, room, onEdit, onDelete }) {
  const status = (room.status || "AVAILABLE").toUpperCase();
  const colors = STATUS_COLORS(t)[status] || STATUS_COLORS(t).AVAILABLE;
  const occupied = room.occupied ?? 0;
  const capacity = room.capacity ?? 0;
  const occupancyPct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

  const amenitiesList = (room.amenities || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 14,
      padding: 16,
      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
      cursor: "default",
      position: "relative",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: t.accent, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Room
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text, lineHeight: 1.1, marginTop: 2 }}>
            {room.roomNumber}
          </div>
          <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>
            {capitalise(room.type) || "Room"}
            {room.block && <> · Block {room.block}</>}
            {room.floor != null && <> · Floor {room.floor}</>}
          </div>
        </div>
        <span style={{
          padding: "3px 9px",
          borderRadius: 999,
          background: colors.bg,
          color: colors.fg,
          fontSize: 11,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}>
          {capitalise(status)}
        </span>
      </div>

      {/* Capacity bar */}
      <div style={{ marginTop: 14 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: t.muted,
          marginBottom: 6,
        }}>
          <span>{occupied} / {capacity} occupied</span>
          <span>{occupancyPct}%</span>
        </div>
        <div style={{ height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${occupancyPct}%`,
            background: occupancyPct >= 100 ? t.danger : occupancyPct >= 75 ? t.warning : t.accent,
            borderRadius: 4,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Rent + amenities */}
      <div style={{ marginTop: 12, fontSize: 12, color: t.muted }}>
        {room.monthlyRent != null && (
          <div>
            <span style={{ color: t.muted }}>Rent: </span>
            <strong style={{ color: t.text }}>{formatINR(room.monthlyRent)}/month</strong>
          </div>
        )}
        {amenitiesList.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
            {amenitiesList.slice(0, 3).map(a => (
              <span key={a} style={{
                padding: "2px 7px",
                background: `${t.accent}1a`,
                color: t.accent,
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
              }}>{a}</span>
            ))}
            {amenitiesList.length > 3 && (
              <span style={{ fontSize: 10, color: t.muted }}>+{amenitiesList.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${t.border}`,
          display: "flex",
          gap: 6,
        }}>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                background: "transparent",
                color: t.text,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✎ Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete room"
              style={{
                width: 34,
                padding: "6px 8px",
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                background: "transparent",
                color: t.danger,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              🗑
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatTile({ t, label, value, color, hint }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: 14,
    }}>
      <div style={{ fontSize: 10, color: t.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4, lineHeight: 1.1 }}>
        {value ?? 0}
      </div>
      {hint && <div style={{ fontSize: 10, color: t.muted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

function Pagination({ t, page, totalPages, onPageChange }) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);
  const btnBase = {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.text,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "0 10px",
  };
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        style={{ ...btnBase, opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? "not-allowed" : "pointer" }}
      >← Prev</button>
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
        >{p + 1}</button>
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
      >Next →</button>
    </div>
  );
}

function CardGridSkeleton({ t }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: 14,
    }}>
      <style>{`@keyframes hms-shimmer { 0% { opacity: 0.5; } 50% { opacity: 0.85; } 100% { opacity: 0.5; } }`}</style>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          padding: 16,
          minHeight: 170,
        }}>
          <div style={{ height: 12, width: "30%", background: t.border, borderRadius: 4, animation: "hms-shimmer 1.4s ease-in-out infinite", marginBottom: 8 }} />
          <div style={{ height: 22, width: "50%", background: t.border, borderRadius: 4, animation: "hms-shimmer 1.4s ease-in-out infinite", marginBottom: 6 }} />
          <div style={{ height: 10, width: "70%", background: t.border, borderRadius: 4, animation: "hms-shimmer 1.4s ease-in-out infinite", marginBottom: 18 }} />
          <div style={{ height: 6, background: t.border, borderRadius: 4, animation: "hms-shimmer 1.4s ease-in-out infinite", marginBottom: 12 }} />
          <div style={{ height: 11, width: "60%", background: t.border, borderRadius: 4, animation: "hms-shimmer 1.4s ease-in-out infinite" }} />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ t, error, onRetry }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
      padding: 28, textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: `${t.danger}1a`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 12,
      }}>⚠️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>Could not load rooms</h3>
      <p style={{ fontSize: 13, color: t.muted, marginTop: 6, marginBottom: 14 }}>
        {error?.message || "Something went wrong while talking to the server."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: t.accent, color: "#fff",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >Try again</button>
    </div>
  );
}

function EmptyState({ t, statusFilter, canAdd, onAdd }) {
  const filtered = statusFilter !== "ALL";
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
      padding: 36, textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: `${t.accent}1a`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 12,
      }}>🚪</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>
        {filtered ? `No ${capitalise(statusFilter).toLowerCase()} rooms` : "No rooms yet"}
      </h3>
      <p style={{ fontSize: 13, color: t.muted, marginTop: 6, marginBottom: 14, maxWidth: 360, marginInline: "auto" }}>
        {filtered
          ? "Try a different status filter or add new rooms."
          : "Add your first room to start managing the hostel."}
      </p>
      {!filtered && canAdd && (
        <button
          type="button"
          onClick={onAdd}
          style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: t.accent, color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >＋ Add room</button>
      )}
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

// ─── helpers ────────────────────────────────────────────────────────────────

function STATUS_COLORS(t) {
  return {
    AVAILABLE:   { bg: `${t.success}1f`, fg: t.success },
    OCCUPIED:    { bg: `${t.accent}1f`,  fg: t.accent  },
    MAINTENANCE: { bg: `${t.warning}1f`, fg: t.warning },
    RESERVED:    { bg: `${t.purple}1f`,  fg: t.purple  },
  };
}

function computeStats(items) {
  return items.reduce((acc, r) => {
    const s = (r.status || "").toUpperCase();
    if (s === "AVAILABLE")   acc.available++;
    if (s === "OCCUPIED")    acc.occupied++;
    if (s === "MAINTENANCE") acc.maintenance++;
    if (s === "RESERVED")    acc.reserved++;
    return acc;
  }, { available: 0, occupied: 0, maintenance: 0, reserved: 0 });
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

function capitalise(value) {
  if (!value) return "";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
