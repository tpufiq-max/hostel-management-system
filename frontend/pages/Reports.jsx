import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { reportService } from "../features/reports/reportService";

export default function Reports() {
  const { t } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await reportService.summary());
    } catch (err) {
      setError(err?.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = data ? [
    {
      title:  "Occupancy rate",
      value:  data.occupancyRate != null ? `${data.occupancyRate}%` : "—",
      detail: data.occupancyDetail ?? "",
      color:  "var(--success)",
      to:     "/rooms",
    },
    {
      title:  "Fee collection",
      value:  data.totalRevenue != null ? `₹ ${Number(data.totalRevenue).toLocaleString()}` : "—",
      detail: data.revenueDetail ?? "",
      color:  "var(--accent)",
      to:     "/fees",
    },
    {
      title:  "Open complaints",
      value:  data.openComplaints != null ? String(data.openComplaints) : "—",
      detail: data.complaintsDetail ?? "",
      color:  "var(--danger)",
      to:     "/complaint",
    },
    {
      title:  "Checked-in visitors",
      value:  data.checkedInVisitors != null ? String(data.checkedInVisitors) : "—",
      detail: data.visitorsDetail ?? "",
      color:  "var(--warning)",
      to:     "/visitor",
    },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Reports</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Snapshot of hostel operations — live from the database.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: t.card,
            color: t.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {error && !loading && (
        <div role="alert" style={{
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)",
          color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12,
        }}>
          {error}
          <button type="button" onClick={load} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {cards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => navigate(card.to)}
              style={{
                textAlign: "left",
                padding: 24,
                borderRadius: 20,
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderTop: `4px solid ${card.color}`,
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 12px 32px ${card.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 11, color: card.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: card.color, letterSpacing: -1, marginBottom: 8 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, color: t.muted }}>
                {card.detail}
              </div>
              <div style={{ marginTop: 16, fontSize: 11, color: card.color, fontWeight: 600 }}>
                View details →
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: 16, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, fontSize: 12, color: t.muted }}>
        Data pulled live from <strong style={{ color: t.text }}>/api/dashboard/stats</strong> and <strong style={{ color: t.text }}>/api/visitors</strong>.
        Click any card to drill into that section.
      </div>
    </div>
  );
}
