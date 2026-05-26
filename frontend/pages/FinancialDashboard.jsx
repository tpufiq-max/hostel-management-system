import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { feesService } from "../features/fees/feesService";
import { dashboardService } from "../features/dashboard/dashboardService";

const FEE_TYPE_COLORS = [
  "var(--accent)",
  "var(--success)",
  "var(--warning)",
  "var(--purple)",
  "var(--danger)",
];

export default function FinancialDashboard() {
  const { t } = useContext(ThemeContext);
  const [fees, setFees]           = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [feesRes, statsRes] = await Promise.allSettled([
        feesService.list({ page, size: PAGE_SIZE }),
        dashboardService.stats(),
      ]);
      if (feesRes.status  === "fulfilled") {
        setFees(feesRes.value?.content || []);
        setTotalPages(feesRes.value?.totalPages || 0);
      }
      if (statsRes.status === "fulfilled") setStats(statsRes.value);
    } catch (err) {
      setError(err?.message || "Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => {
    let paid = 0, pending = 0, overdue = 0;
    const byType = {};
    for (const f of fees) {
      const amt = Number(f.amount) || 0;
      if (f.paymentStatus === "PAID")    paid    += amt;
      else if (f.paymentStatus === "OVERDUE") overdue += amt;
      else                               pending += amt;
      const type = f.feeType || "OTHER";
      byType[type] = (byType[type] || 0) + amt;
    }
    const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
    return { paid, pending, overdue, outstanding: pending + overdue, typeEntries, maxType: typeEntries[0]?.[1] || 1 };
  }, [fees]);

  const pendingFees = useMemo(
    () => fees.filter(f => f.paymentStatus === "PENDING" || f.paymentStatus === "OVERDUE"),
    [fees]
  );

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString()}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Financial Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Revenue, fees, and collection status — live from the database.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} style={navBtn(t, loading)}>
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={load} style={linkBtnStyle}>Retry</button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <>
          {/* Fee summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <MetricCard t={t} label="Paid revenue"      value={fmt(summary.paid)}        color="var(--success)" hint="from this page" />
            <MetricCard t={t} label="Pending"           value={fmt(summary.pending)}     color="var(--warning)" hint="not yet paid" />
            <MetricCard t={t} label="Overdue"           value={fmt(summary.overdue)}     color="var(--danger)"  hint="past due date" />
            <MetricCard t={t} label="Total outstanding" value={fmt(summary.outstanding)} color={t.muted}        hint="pending + overdue" />
          </div>

          {/* Hostel stats (from dashboard endpoint) */}
          {stats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <MetricCard t={t} label="Total students"  value={stats.totalStudents}  color={t.accent}         hint="registered"                  small />
              <MetricCard t={t} label="Active students" value={stats.activeStudents} color="var(--success)"   hint=""                            small />
              <MetricCard t={t} label="Rooms occupied"  value={`${stats.occupiedRooms}/${stats.totalRooms}`} color={t.accent} hint={`${Math.round(stats.occupancyRate ?? 0)}%`} small />
              <MetricCard t={t} label="Open complaints" value={stats.openComplaints} color="var(--danger)"    hint=""                            small />
            </div>
          )}

          {/* Main grid */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 16 }}>
            {/* Recent fee records */}
            <div style={panel(t)}>
              <div style={panelHeader(t)}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>Recent fee records</h2>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button type="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={pgBtn(t, page === 0)}>←</button>
                  <span style={{ fontSize: 12, color: t.muted }}>{page + 1}/{Math.max(1, totalPages)}</span>
                  <button type="button" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pgBtn(t, page >= totalPages - 1)}>→</button>
                </div>
              </div>

              {fees.length === 0 ? (
                <div style={{ padding: "28px 16px", textAlign: "center", color: t.muted, fontSize: 13 }}>
                  No fee records yet. Add some from the <a href="/fees" style={{ color: t.accent }}>Fees page</a>.
                </div>
              ) : (
                fees.map(f => {
                  const isPaid = f.paymentStatus === "PAID";
                  const isOverdue = f.paymentStatus === "OVERDUE";
                  const color = isPaid ? "var(--success)" : isOverdue ? "var(--danger)" : "var(--warning)";
                  return (
                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${t.border}`, gap: 12 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {f.studentName || `Student #${f.studentId}`}
                        </div>
                        <div style={{ fontSize: 11, color: t.muted }}>
                          {f.feeType || "Fee"}{f.semester ? ` · ${f.semester}` : ""}
                          {f.dueDate  ? ` · Due ${f.dueDate}` : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color }}>{fmt(f.amount)}</div>
                        <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: "uppercase" }}>{f.paymentStatus}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Fee-type breakdown */}
              {summary.typeEntries.length > 0 && (
                <div style={panel(t)}>
                  <div style={panelHeader(t)}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>By fee type</h2>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {summary.typeEntries.map(([type, amount], i) => {
                      const col = FEE_TYPE_COLORS[i % FEE_TYPE_COLORS.length];
                      return (
                        <div key={type}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: t.text, fontWeight: 600 }}>{type}</span>
                            <span style={{ color: col, fontWeight: 700 }}>{fmt(amount)}</span>
                          </div>
                          <div style={{ height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${(amount / summary.maxType) * 100}%`, height: "100%", background: col, borderRadius: 4 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pending collections */}
              <div style={panel(t)}>
                <div style={panelHeader(t)}>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>Pending collections</h2>
                  <span style={{ fontSize: 11, color: "var(--warning)", fontWeight: 700 }}>
                    {pendingFees.length} record{pendingFees.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {pendingFees.length === 0 ? (
                  <div style={{ padding: "20px 16px", textAlign: "center", color: t.muted, fontSize: 13 }}>
                    All fees on this page are paid ✓
                  </div>
                ) : (
                  pendingFees.slice(0, 6).map(f => {
                    const color = f.paymentStatus === "OVERDUE" ? "var(--danger)" : "var(--warning)";
                    return (
                      <div key={f.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {f.studentName || `Student #${f.studentId}`}
                          </div>
                          {f.dueDate && <div style={{ fontSize: 10, color }}>Due {f.dueDate}</div>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>{fmt(f.amount)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Subcomponents ─────────────────────────────────────────────── */

function MetricCard({ t, label, value, color, hint, small }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: `3px solid ${color}`, borderRadius: 12, padding: small ? 14 : 18 }}>
      <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: small ? 20 : 28, fontWeight: 800, color, marginTop: 4, letterSpacing: -0.5 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

/* ── Style helpers ─────────────────────────────────────────────── */

const errorBanner   = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkBtnStyle  = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };
function panel(t)   { return { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden" }; }
function panelHeader(t) { return { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${t.border}`, background: t.bg }; }
function navBtn(t, disabled) { return { padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: disabled ? "wait" : "pointer", opacity: disabled ? 0.6 : 1 }; }
function pgBtn(t, disabled) { return { padding: "4px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: disabled ? "transparent" : t.card, color: disabled ? t.muted : t.text, fontSize: 12, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1 }; }
