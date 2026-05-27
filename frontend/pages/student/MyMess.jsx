import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { get } from "../../api/api";
import {
  PageHeader, Panel, SectionTitle, Alert, Loading, Button, EmptyState, formatDate,
} from "./_meShared";

/**
 * /me/mess — student's monthly mess bill.
 *
 *   • Top: year + month picker (defaults to current month).
 *   • Summary card: grand total (big number) + days attended + special dinners.
 *   • Day-by-day table: B / L / D pills (✓/✗), special dinner ✓/✗, daily ₹.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July",    "August",   "September", "October", "November", "December",
];

function nowYM() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function MyMess() {
  const { t } = useContext(ThemeContext);

  const initial = nowYM();
  const [year,    setYear]    = useState(initial.year);
  const [month,   setMonth]   = useState(initial.month);
  const [bill,    setBill]    = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const reload = useCallback(async (y, m) => {
    setLoading(true);
    setError(null);
    try {
      const [billData, attData] = await Promise.all([
        get(`/me/mess/bill?year=${y}&month=${m}`),
        get(`/me/mess/attendance?year=${y}&month=${m}`),
      ]);
      setBill(billData || null);
      setAttendance(Array.isArray(attData) ? attData : []);
    } catch (err) {
      setError(err?.message || "Failed to load mess bill.");
      setBill(null);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(year, month); }, [year, month, reload]);

  // Build (date → { BREAKFAST, LUNCH, DINNER, SPECIAL_DINNER } → "PRESENT"|"ABSENT")
  const attendanceMap = useMemo(() => {
    const map = {};
    for (const r of attendance) {
      if (!r?.date || !r?.mealType) continue;
      (map[r.date] ||= {})[r.mealType] = r.status;
    }
    return map;
  }, [attendance]);

  const yearOptions = useMemo(() => {
    const cur = nowYM().year;
    const ys = [];
    for (let y = cur - 4; y <= cur + 1; y++) ys.push(y);
    return ys;
  }, []);

  const days = bill?.days ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t}
        title="My Mess Bill"
        subtitle="Daily attendance and monthly mess charges."
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              style={selectStyle(t)}
              aria-label="Month"
            >
              {MONTHS.map((label, i) => (
                <option key={i + 1} value={i + 1}>{label}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={selectStyle(t)}
              aria-label="Year"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <Button t={t} onClick={() => reload(year, month)}>Refresh</Button>
          </div>
        } />

      {error && <Alert t={t} kind="danger">{error}</Alert>}

      {/* ── Summary card ──────────────────────────────────── */}
      <Panel t={t}>
        <SectionTitle t={t}>Bill summary — {MONTHS[month - 1]} {year}</SectionTitle>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}>
          <Hero t={t} label="Grand total" value={`₹ ${(bill?.grandTotal ?? 0).toLocaleString()}`} color={t.accent} />
          <Stat t={t} label="Days attended" value={bill?.daysAttended ?? 0} color={t.success ?? "#22c55e"} />
          <Stat t={t} label="Total meals (B+L+D)" value={bill?.totalMeals ?? 0} color={t.accent} />
          <Stat t={t} label="Special dinners" value={bill?.specialDinnerCount ?? 0} color={t.warning ?? "#f59e0b"} />
        </div>
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap",
          color: t.muted, fontSize: 12, marginTop: 4,
        }}>
          <span>Breakfasts: <b style={{ color: t.text }}>{bill?.breakfastCount ?? 0}</b></span>
          <span>·</span>
          <span>Lunches: <b style={{ color: t.text }}>{bill?.lunchCount ?? 0}</b></span>
          <span>·</span>
          <span>Dinners: <b style={{ color: t.text }}>{bill?.dinnerCount ?? 0}</b></span>
        </div>
      </Panel>

      {/* ── Day-by-day ───────────────────────────────────── */}
      {loading ? <Loading t={t} /> :
       days.length === 0 ? (
        <EmptyState t={t} icon="🍽️" title="No meals recorded for this month"
                    subtitle="Once the warden marks your meals, they'll show up here." />
      ) : (
        <Panel t={t}>
          <SectionTitle t={t}>Day-by-day</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={th(t)}>Date</th>
                  <th style={{ ...th(t), textAlign: "center" }}>B</th>
                  <th style={{ ...th(t), textAlign: "center" }}>L</th>
                  <th style={{ ...th(t), textAlign: "center" }}>D</th>
                  <th style={{ ...th(t), textAlign: "center" }}>Special</th>
                  <th style={{ ...th(t), textAlign: "right" }}>Charge</th>
                </tr>
              </thead>
              <tbody>
                {days.map(d => (
                  <DayRow key={d.date} t={t} day={d} statuses={attendanceMap[d.date] || {}} />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ ...td(t), textAlign: "right", fontWeight: 700 }}>
                    Grand total
                  </td>
                  <td style={{ ...td(t), textAlign: "right", fontWeight: 800, color: t.accent }}>
                    ₹ {(bill?.grandTotal ?? 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* DayRow — uses the per-slot status map (from /me/mess/attendance) to render
 * the correct B / L / D / Special pills for the day. */
function DayRow({ t, day, statuses }) {
  const isP = (k) => statuses[k] === "PRESENT";
  return (
    <tr>
      <td style={td(t)}>{formatDate(day.date)}</td>
      <td style={{ ...td(t), textAlign: "center" }}>{pill(t, isP("BREAKFAST"))}</td>
      <td style={{ ...td(t), textAlign: "center" }}>{pill(t, isP("LUNCH"))}</td>
      <td style={{ ...td(t), textAlign: "center" }}>{pill(t, isP("DINNER"))}</td>
      <td style={{ ...td(t), textAlign: "center" }}>{pill(t, isP("SPECIAL_DINNER") || day.specialDinnerPresent)}</td>
      <td style={{ ...td(t), textAlign: "right", fontWeight: 700, color: day.total > 0 ? t.text : t.muted }}>
        ₹ {day.total}
      </td>
    </tr>
  );
}

function pill(t, present) {
  const fg = present ? (t.success ?? "#22c55e") : (t.muted ?? "#94a3b8");
  return (
    <span style={{
      display: "inline-block", minWidth: 26, fontSize: 13,
      fontWeight: 700, padding: "2px 8px", borderRadius: 999,
      background: `${fg}1a`, color: fg, border: `1px solid ${fg}40`,
    }}>
      {present ? "✓" : "✗"}
    </span>
  );
}

const selectStyle = (t) => ({
  padding: "9px 12px", borderRadius: 10,
  border: `1px solid ${t.border}`, background: t.card, color: t.text,
  fontSize: 13, outline: "none", cursor: "pointer",
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

function Hero({ t, label, value, color }) {
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14, padding: 16,
      gridColumn: "span 1",
    }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

function Stat({ t, label, value, color }) {
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
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
