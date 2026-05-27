import React, { useContext, useEffect, useState, useCallback } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { get } from "../../api/api";
import {
  PageHeader, Panel, SectionTitle, Alert, Loading, Button,
  StatusPill, EmptyState, formatCurrency, formatDate,
} from "./_meShared";

/**
 * /me/fees — own fee records only. No revenue, no other students.
 */
export default function MyFees() {
  const { t } = useContext(ThemeContext);

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get("/me/fees");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load fees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const totalPaid    = rows.filter(r => r.paymentStatus === "PAID").reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalPending = rows.filter(r => r.paymentStatus !== "PAID").reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t}
        title="My Fees"
        subtitle="Your hostel fee statement."
        right={<Button t={t} onClick={reload}>Refresh</Button>} />

      {error && <Alert t={t} kind="danger">{error}</Alert>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}>
        <SummaryCard t={t} label="Total paid"      value={formatCurrency(totalPaid)}    color={t.success} />
        <SummaryCard t={t} label="Outstanding"     value={formatCurrency(totalPending)} color={t.warning} />
        <SummaryCard t={t} label="Records"         value={rows.length}                  color={t.accent} />
      </div>

      {loading ? <Loading t={t} /> :
       rows.length === 0 ? (
        <EmptyState t={t} icon="₹" title="No fee records" subtitle="Once the admin issues a fee, it will appear here." />
      ) : (
        <Panel t={t}>
          <SectionTitle t={t}>Statement</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
              <thead>
                <tr>
                  {["Type", "Semester", "Amount", "Due", "Status", "Paid on", "Method"].map(h => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "10px 12px", color: t.muted,
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                      textTransform: "uppercase",
                      borderBottom: `1px solid ${t.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td style={td(t)}>{r.feeType || "—"}</td>
                    <td style={td(t)}>{r.semester || "—"}</td>
                    <td style={{ ...td(t), fontWeight: 700, color: t.text }}>{formatCurrency(r.amount)}</td>
                    <td style={td(t)}>{formatDate(r.dueDate)}</td>
                    <td style={td(t)}><StatusPill t={t} status={r.paymentStatus} /></td>
                    <td style={td(t)}>{formatDate(r.paymentDate)}</td>
                    <td style={td(t)}>{r.paymentMethod || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

const td = (t) => ({
  padding: "10px 12px", borderBottom: `1px solid ${t.border}`,
  color: t.text, verticalAlign: "middle",
});

function SummaryCard({ t, label, value, color }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14, padding: 18,
    }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 6, letterSpacing: -0.5 }}>
        {value}
      </div>
    </div>
  );
}
