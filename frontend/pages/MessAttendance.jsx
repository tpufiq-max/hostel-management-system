import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { get, post } from "../api/api";

/**
 * /mess/attendance — admin/warden daily attendance grid for the Smart Mess
 * module.
 *
 *   • Top: date picker (defaults to today) and Save button.
 *   • Body: one row per active student; checkboxes for B / L / D / Special.
 *   • Per row: live "today's charge" preview computed client-side using the
 *     same pricing rules the backend uses (so staff can sanity-check before
 *     saving). Staff sees the authoritative number from the backend bill
 *     endpoint after Save.
 */

const MEALS = [
  { key: "breakfast",      label: "Breakfast", short: "B", enum: "BREAKFAST"      },
  { key: "lunch",          label: "Lunch",     short: "L", enum: "LUNCH"          },
  { key: "dinner",         label: "Dinner",    short: "D", enum: "DINNER"         },
  { key: "specialDinner",  label: "Special",   short: "S", enum: "SPECIAL_DINNER" },
];

/* Same pricing function the server uses — single source of truth client-side. */
function dailyCharge({ breakfast, lunch, dinner, specialDinner }) {
  let meals = 0;
  if (breakfast === "PRESENT") meals++;
  if (lunch === "PRESENT")     meals++;
  if (dinner === "PRESENT")    meals++;
  const base = meals === 0 ? 0 : meals === 1 ? 50 : meals === 2 ? 100 : 115;
  const special = specialDinner === "PRESENT" ? 50 : 0;
  return { meals, base, special, total: base + special };
}

function isoToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function MessAttendance() {
  const { t } = useContext(ThemeContext);

  const [date,    setDate]    = useState(isoToday());
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [info,    setInfo]    = useState(null);

  const reload = useCallback(async (d) => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const data = await get(`/mess/attendance?date=${encodeURIComponent(d)}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load attendance.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(date); }, [date, reload]);

  const updateCell = (studentId, mealKey, present) => {
    setRows(rs => rs.map(r =>
      r.studentId === studentId ? { ...r, [mealKey]: present ? "PRESENT" : "ABSENT" } : r
    ));
  };

  const totals = useMemo(() => {
    let totalRevenue = 0;
    let presentRows  = 0;
    for (const r of rows) {
      const c = dailyCharge(r);
      totalRevenue += c.total;
      if (c.total > 0) presentRows++;
    }
    return { totalRevenue, presentRows };
  }, [rows]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const entries = [];
      for (const r of rows) {
        for (const m of MEALS) {
          entries.push({
            studentId: r.studentId,
            mealType:  m.enum,
            status:    r[m.key] === "PRESENT" ? "PRESENT" : "ABSENT",
          });
        }
      }
      const res = await post("/mess/attendance", { date, entries });
      const marked = res?.marked ?? entries.length;
      setInfo(`Saved ${marked} attendance entries for ${date}.`);
    } catch (err) {
      setError(err?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>
            🍽️ Mess Attendance
          </h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Mark per-student meal attendance and preview the daily charge.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: t.muted, fontWeight: 600 }}>
            <span>DATE</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                padding: "8px 10px", borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.card, color: t.text, fontSize: 13, outline: "none",
                minWidth: 160,
              }}
            />
          </label>
          <button onClick={() => reload(date)} disabled={loading} style={btn(t, "default")}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button onClick={save} disabled={saving || loading || rows.length === 0} style={btn(t, "primary")}>
            {saving ? "Saving…" : "💾 Save"}
          </button>
        </div>
      </div>

      {error && <Alert t={t} kind="danger">{error}</Alert>}
      {info  && <Alert t={t} kind="success">{info}</Alert>}

      {/* ── Summary ─────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}>
        <Stat t={t} label="Students" value={rows.length} color={t.accent} />
        <Stat t={t} label="Eating today (≥1 meal)" value={totals.presentRows} color={t.success ?? "#22c55e"} />
        <Stat t={t} label="Estimated revenue (₹)" value={totals.totalRevenue.toLocaleString()} color={t.warning ?? "#f59e0b"} />
      </div>

      {/* ── Grid ────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: 30, textAlign: "center", color: t.muted, fontSize: 13 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{
          padding: "40px 16px", textAlign: "center", color: t.muted,
          background: t.card, border: `1px dashed ${t.border}`, borderRadius: 14,
        }}>
          <div style={{ fontSize: 32 }}>🍽️</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginTop: 6 }}>No active students yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Add students from the Students page to start marking attendance.</div>
        </div>
      ) : (
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16,
          padding: 12, overflowX: "auto",
        }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                <th style={th(t)}>Student</th>
                <th style={th(t)}>Roll #</th>
                {MEALS.map(m => (
                  <th key={m.key} style={{ ...th(t), textAlign: "center" }}>
                    {m.short} <span style={{ color: t.muted, fontWeight: 500 }}>({m.label})</span>
                  </th>
                ))}
                <th style={{ ...th(t), textAlign: "right" }}>Today's charge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const c = dailyCharge(r);
                return (
                  <tr key={r.studentId}>
                    <td style={td(t)}>{r.name}</td>
                    <td style={td(t)}>{r.rollNumber || "—"}</td>
                    {MEALS.map(m => (
                      <td key={m.key} style={{ ...td(t), textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={r[m.key] === "PRESENT"}
                          onChange={e => updateCell(r.studentId, m.key, e.target.checked)}
                          style={{ width: 18, height: 18, cursor: "pointer", accentColor: t.accent }}
                          aria-label={`${m.label} for ${r.name}`}
                        />
                      </td>
                    ))}
                    <td style={{ ...td(t), textAlign: "right", fontWeight: 700, color: c.total > 0 ? t.text : t.muted }}>
                      ₹ {c.total}
                      {c.special > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: t.warning ?? "#f59e0b", fontWeight: 600 }}>
                          (+₹{c.special} special)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const btn = (t, variant) => ({
  padding: "9px 16px", borderRadius: 10,
  border: `1px solid ${variant === "primary" ? t.accent : t.border}`,
  background: variant === "primary" ? t.accent : t.card,
  color: variant === "primary" ? "#fff" : t.text,
  fontWeight: 600, fontSize: 13, cursor: "pointer",
});

const th = (t) => ({
  textAlign: "left", padding: "10px 12px", color: t.muted,
  fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
  textTransform: "uppercase", borderBottom: `1px solid ${t.border}`,
});

const td = (t) => ({
  padding: "10px 12px", borderBottom: `1px solid ${t.border}`,
  color: t.text, verticalAlign: "middle",
});

function Alert({ t, kind = "info", children }) {
  const color = kind === "danger"  ? (t.danger  ?? "#ef4444")
              : kind === "success" ? (t.success ?? "#22c55e")
              : kind === "warning" ? (t.warning ?? "#f59e0b")
              : t.accent;
  return (
    <div role="alert" style={{
      padding: "10px 14px", borderRadius: 12,
      background: `${color}18`, border: `1px solid ${color}55`,
      color, fontSize: 13,
    }}>
      {children}
    </div>
  );
}

function Stat({ t, label, value, color }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14, padding: 14,
    }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 6 }}>{value}</div>
    </div>
  );
}
