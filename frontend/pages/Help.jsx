import React, { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

/**
 * /help
 *
 * Static help & support page: FAQ accordion, contact card and
 * quick links to the main parts of the system. Pure client-side —
 * no backend dependency.
 */

const FAQ = [
  {
    q: "How do I add a new student?",
    a: "Go to Sidebar → Students → click \"Add Student\". Fill in name, email, roll number, course, year and address, then save. The student is immediately searchable and ready to be allocated to a room.",
  },
  {
    q: "How do room allocations work?",
    a: "Open Allocation, pick an unoccupied room, choose a student, and confirm. The room's occupied seats counter and the student's room/bed numbers are updated automatically.",
  },
  {
    q: "How do I record fee payments?",
    a: "Go to Fees → select a student → click \"Add Payment\". Enter the amount, semester, and payment method. The student's fee status is recalculated based on the latest balance.",
  },
  {
    q: "Where can I see analytics and reports?",
    a: "Sidebar → Analytics gives charts for occupancy, revenue and complaints. Reports lets you export CSV/PDF for any date range.",
  },
  {
    q: "How do I change my password?",
    a: "Click your avatar in the top-right → Settings → Security · Change password. Enter your current password, set a new one (min 6 characters), and save.",
  },
  {
    q: "I see an SQL syntax error about \"year\". What's going on?",
    a: "That's an outdated build of the backend running locally. Stop it, rebuild from the backend folder with `mvn clean package -DskipTests`, then restart the jar. The codebase already maps the year field to the study_year column.",
  },
  {
    q: "What happens to data when I restart the dev backend?",
    a: "By default the dev profile uses an in-memory H2 database, so all data is wiped on restart. Switch to the prod profile (MySQL) for persistent data.",
  },
  {
    q: "How are roles enforced?",
    a: "Routes are wrapped in ProtectedRoute with allowedRoles. Admins see everything; students see only Dashboard, Complaint, Maintenance, Reports and Events. The backend re-checks authorisation on every request.",
  },
];

export default function Help() {
  const { t, isDark } = useContext(ThemeContext);
  const [openIdx, setOpenIdx] = useState(0);
  const [search, setSearch]   = useState("");

  const filtered = FAQ.filter(f => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t}
                  title="Help & Support"
                  subtitle="Guides, FAQs and how to reach us." />

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
        gap: 24,
        alignItems: "flex-start",
      }}>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <Panel t={t}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <SectionTitle t={t}>Frequently asked questions</SectionTitle>
            <input
              type="search"
              placeholder="Search FAQs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.card,
                color: t.text,
                fontSize: 13,
                outline: "none",
                minWidth: 200,
              }}
              onFocus={e => e.currentTarget.style.borderColor = t.accent}
              onBlur={e => e.currentTarget.style.borderColor = t.border}
            />
          </div>

          {filtered.length === 0 && (
            <div style={{
              fontSize: 13, color: t.muted, padding: "12px 0",
            }}>
              No results for "{search}". Try a different keyword.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {filtered.map((item, i) => {
              const open = openIdx === i;
              return (
                <div key={item.q} style={{
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  background: t.card,
                  overflow: "hidden",
                  transition: "border-color 0.15s",
                }}>
                  <button
                    onClick={() => setOpenIdx(open ? -1 : i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 14px",
                      background: "transparent",
                      border: "none",
                      color: t.text,
                      fontSize: 14, fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span style={{ flex: 1 }}>{item.q}</span>
                    <span style={{
                      fontSize: 12, color: t.muted,
                      transform: open ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}>
                      ▼
                    </span>
                  </button>
                  {open && (
                    <div style={{
                      padding: "0 14px 14px",
                      fontSize: 13, color: t.muted,
                      lineHeight: 1.55,
                      borderTop: `1px solid ${t.border}`,
                      paddingTop: 12,
                    }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        {/* ── Contact + quick links ─────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel t={t}>
            <SectionTitle t={t}>Contact support</SectionTitle>
            <Contact t={t} icon="✉️" label="Email"
                     value="support@hostel.com"
                     href="mailto:support@hostel.com" />
            <Contact t={t} icon="📞" label="Phone"
                     value="+91 80 4000 5000"
                     href="tel:+918040005000" />
            <Contact t={t} icon="🕒" label="Hours"
                     value="Mon–Sat · 9:00–18:00 IST" />
            <div style={{
              fontSize: 12, color: t.muted, marginTop: 8,
              padding: "10px 12px", borderRadius: 10,
              background: isDark ? "#0b1220" : "#f8fafc",
              border: `1px solid ${t.border}`,
            }}>
              Tip: include screenshots and the exact error message — it helps us diagnose problems faster.
            </div>
          </Panel>

          <Panel t={t}>
            <SectionTitle t={t}>Quick links</SectionTitle>
            <QuickLink t={t} icon="🏠" to="/">Dashboard</QuickLink>
            <QuickLink t={t} icon="👤" to="/profile">My Profile</QuickLink>
            <QuickLink t={t} icon="⚙️" to="/settings">Settings</QuickLink>
            <QuickLink t={t} icon="📢" to="/notice">Notices</QuickLink>
            <QuickLink t={t} icon="📋" to="/complaint">Submit a complaint</QuickLink>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ───────────────────────────────────────────────────────── */

function PageHeader({ t, title, subtitle }) {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>{title}</h1>
      <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>{subtitle}</p>
    </div>
  );
}

function Panel({ t, children }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ t, children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: t.muted,
      letterSpacing: 0.6, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function Contact({ t, icon, label, value, href }) {
  const inner = (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 12px", borderRadius: 12,
      border: `1px solid ${t.border}`, background: t.card,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: `${t.accent}22`, color: t.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: t.muted, fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: 0.4 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: t.text, fontWeight: 600,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </div>
      </div>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: "none" }}>{inner}</a> : inner;
}

function QuickLink({ t, icon, to, children }) {
  return (
    <a href={`#${to}`}
       onClick={e => {
         e.preventDefault();
         // works whether the app uses HashRouter or BrowserRouter
         if (window.location.pathname === to) return;
         window.history.pushState({}, "", to);
         window.dispatchEvent(new PopStateEvent("popstate"));
       }}
       style={{
         display: "flex", alignItems: "center", gap: 10,
         padding: "10px 12px", borderRadius: 10,
         color: t.text, textDecoration: "none",
         border: `1px solid ${t.border}`, background: t.card,
         fontSize: 13, fontWeight: 600,
         transition: "border-color 0.15s, transform 0.15s",
       }}
       onMouseEnter={e => {
         e.currentTarget.style.borderColor = t.accent;
         e.currentTarget.style.transform = "translateY(-1px)";
       }}
       onMouseLeave={e => {
         e.currentTarget.style.borderColor = t.border;
         e.currentTarget.style.transform = "none";
       }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span>{children}</span>
    </a>
  );
}
