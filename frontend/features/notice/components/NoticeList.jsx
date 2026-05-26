import React, { useCallback, useContext, useEffect, useState } from "react";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import { ThemeContext } from "../../../context/ThemeContext";
import { useNotification } from "../../../context/NotificationContext";
import { noticeService } from "../noticeService";

const CATEGORY_FILTERS = [
  { value: "",          label: "All"       },
  { value: "GENERAL",   label: "General"   },
  { value: "ACADEMIC",  label: "Academic"  },
  { value: "HOSTEL",    label: "Hostel"    },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "EVENT",     label: "Event"     },
];

const PRIORITY_TONE = {
  LOW:    "var(--success)",
  NORMAL: "var(--accent)",
  HIGH:   "var(--warning)",
  URGENT: "var(--danger)",
};

const PAGE_SIZE = 10;

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function NoticeList({ refreshKey, onEdit }) {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyRowId, setBusyRowId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await noticeService.list({
        page,
        size: PAGE_SIZE,
        category,
        active: activeOnly || undefined,
      });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load notices.");
    } finally {
      setLoading(false);
    }
  }, [page, category, activeOnly]);

  useEffect(() => { reload(); }, [reload, refreshKey]);

  async function handleDelete(notice) {
    if (busyRowId) return;
    if (!window.confirm(`Delete notice "${notice.title}"?`)) return;
    setBusyRowId(notice.id);
    try {
      await noticeService.remove(notice.id);
      toast.success("Notice deleted.");
      reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete notice.");
    } finally {
      setBusyRowId(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>Recent notices</h2>
        <span style={{ fontSize: 12, color: t.muted }}>
          {loading ? "Loading…" : `${data.totalElements ?? data.content.length} total`}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          style={inputStyle(t)}
          aria-label="Filter notices by category"
        >
          {CATEGORY_FILTERS.map((c) => (
            <option key={c.value || "all"} value={c.value}>{c.label}</option>
          ))}
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: t.text, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => { setActiveOnly(e.target.checked); setPage(0); }}
          />
          Active only
        </label>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBannerStyle}>
          {error}
          <button type="button" onClick={reload} style={linkButtonStyle}>Retry</button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : data.content.length === 0 ? (
        <div style={{ padding: "30px 16px", textAlign: "center", color: t.muted, background: t.bg, borderRadius: 12, border: `1px dashed ${t.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>No notices to show</div>
          <div style={{ fontSize: 12 }}>
            {category || activeOnly ? "Try clearing the filters." : "Publish the first one with the form on the left."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.content.map((n) => {
            const tone = PRIORITY_TONE[n.priority] || t.muted;
            return (
              <div
                key={n.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: t.bg,
                  border: `1px solid ${t.border}`,
                  borderLeft: `3px solid ${tone}`,
                  opacity: n.isActive ? 1 : 0.65,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>
                      {n.title}{!n.isActive && <span style={{ marginLeft: 6, color: t.muted, fontSize: 11, fontWeight: 500 }}>(inactive)</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Tag color={tone}>{n.priority}</Tag>
                      <Tag color={t.muted}>{n.category}</Tag>
                      <Tag color={t.muted}>{n.targetAudience}</Tag>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(n)}
                        disabled={busyRowId === n.id}
                        style={tinyButton(t, t.accent)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(n)}
                      disabled={busyRowId === n.id}
                      style={tinyButton(t, "var(--danger)")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ margin: "6px 0", fontSize: 13, color: t.muted, lineHeight: 1.5 }}>
                  {n.content}
                </p>
                <div style={{ fontSize: 11, color: t.muted, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>Published {formatDate(n.publishedAt)}</span>
                  {n.expiresAt && <span>Expires {formatDate(n.expiresAt)}</span>}
                  {n.publishedBy && <span>by {n.publishedBy}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 14 }}>
          <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={pageBtn(t, page === 0)}>
            ← Prev
          </button>
          <span style={{ fontSize: 12, color: t.muted }}>
            Page <strong style={{ color: t.text }}>{page + 1}</strong> of {data.totalPages}
          </span>
          <button type="button" onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))} disabled={page >= data.totalPages - 1} style={pageBtn(t, page >= data.totalPages - 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        padding: "2px 8px",
        borderRadius: 999,
        color,
        background: `${color}22`,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  );
}

const errorBannerStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(248,113,113,0.12)",
  border: "1px solid rgba(248,113,113,0.45)",
  color: "var(--danger)",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const linkButtonStyle = {
  marginLeft: "auto",
  background: "none",
  border: "none",
  color: "var(--danger)",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: 12,
};

function inputStyle(t) {
  return {
    padding: "7px 10px",
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.text,
    fontSize: 12,
    outline: "none",
    cursor: "pointer",
  };
}

function tinyButton(t, color) {
  return {
    padding: "5px 10px",
    borderRadius: 8,
    border: `1px solid ${color}55`,
    background: `${color}11`,
    color,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function pageBtn(t, disabled) {
  return {
    padding: "5px 12px",
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: disabled ? "transparent" : t.card,
    color: disabled ? t.muted : t.text,
    fontSize: 11,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
