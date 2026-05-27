import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { get } from "../../api/api";

/**
 * Student-only dashboard. Pulls /api/me/dashboard which is scoped to the
 * caller's own data. No revenue, no occupancy, no other-students info.
 */
export default function StudentDashboard() {
  const { t } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [time, setTime]       = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await get("/me/dashboard");
      setData(d || null);
    } catch (err) {
      setError(err?.message || "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const greeting = (() => {
    const h = time.getHours();
    if (h < 5)  return "Up late";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>
            {greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Your personal hostel summary.
          </p>
        </div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, fontVariantNumeric: "tabular-nums" }}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ fontSize: 10, color: t.muted }}>
            {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" style={{
          padding: "10px 14px", borderRadius: 12,
          background: `${t.danger}18`, border: `1px solid ${t.danger}55`,
          color: t.danger, fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 30, textAlign: "center", color: t.muted }}>Loading…</div>
      ) : !data ? (
        <div style={{ padding: 30, textAlign: "center", color: t.muted }}>
          No dashboard data available.
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            <Stat t={t} color={t.accent}
                  label="Roll number" value={data.rollNumber || "—"}
                  hint={data.name} />
            <Stat t={t} color={t.success}
                  label="Room"
                  value={data.roomNumber ? `Room ${data.roomNumber}` : "Not allocated"}
                  hint={data.bedNumber ? `Bed ${data.bedNumber}` : ""}
                  onClick={() => navigate("/me/room")} />
            <Stat t={t} color={t.warning}
                  label="Fees status" value={data.feesStatus}
                  hint={`Pending ₹ ${formatNum(data.feesPending)}`}
                  onClick={() => navigate("/me/fees")} />
            <Stat t={t} color={t.purple}
                  label="Attendance (30d)"
                  value={`${data.attendancePct ?? 0}%`}
                  hint={`${data.attendanceCount ?? 0} entries`}
                  progress={data.attendancePct}
                  onClick={() => navigate("/me/attendance")} />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}>
            <Panel t={t}
                   title="Open complaints"
                   value={data.openComplaints ?? 0}
                   color={t.danger}
                   cta="Manage →"
                   onClick={() => navigate("/me/complaints")} />
            <Panel t={t}
                   title="Maintenance tickets"
                   value={data.openMaintenance ?? 0}
                   color={t.accent}
                   cta="Manage →"
                   onClick={() => navigate("/me/maintenance")} />
            <Panel t={t}
                   title="Fees paid (₹)"
                   value={formatNum(data.feesPaid)}
                   color={t.success}
                   cta="View statement →"
                   onClick={() => navigate("/me/fees")} />
          </div>

          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 14, padding: 18,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 12 }}>
              Quick actions
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Quick t={t} icon="🔔" label="Submit complaint"      to="/me/complaints"  navigate={navigate} />
              <Quick t={t} icon="🔧" label="Report maintenance"    to="/me/maintenance" navigate={navigate} />
              <Quick t={t} icon="📅" label="Check attendance"      to="/me/attendance"  navigate={navigate} />
              <Quick t={t} icon="₹"  label="View fees"             to="/me/fees"        navigate={navigate} />
              <Quick t={t} icon="📢" label="Notices"               to="/me/notices"     navigate={navigate} />
              <Quick t={t} icon="🧑" label="My profile"            to="/me/profile"     navigate={navigate} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────── */

function Stat({ t, label, value, hint, color, progress, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left", padding: 18,
        background: t.surface, border: `1px solid ${t.border}`,
        borderTop: `3px solid ${color}`, borderRadius: 14,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${color}22`; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 6, letterSpacing: -0.5 }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{hint}</div>}
      {typeof progress === "number" && (
        <div style={{ marginTop: 10, height: 5, background: t.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, Math.max(0, progress))}%`, height: "100%", background: color, transition: "width 0.6s ease" }} />
        </div>
      )}
    </button>
  );
}

function Panel({ t, title, value, color, cta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left", padding: 18,
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 14, cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 8,
        transition: "transform 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.border; }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: t.muted }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600 }}>{cta}</div>
    </button>
  );
}

function Quick({ t, icon, label, to, navigate }) {
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px",
        borderRadius: 10, border: `1px solid ${t.border}`,
        background: t.card, color: t.text,
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        transition: "transform 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = t.accent; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.border; }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function formatNum(n) {
  const v = Number(n) || 0;
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
