import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { studentService } from "../features/student/studentService";
import { feesService } from "../features/fees/feesService";

const PAGE_SIZE = 50;

const FEES_TONE = {
  PAID:    { color: "var(--success)", label: "Paid"    },
  PENDING: { color: "var(--warning)", label: "Pending" },
  OVERDUE: { color: "var(--danger)",  label: "Overdue" },
};

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function StudentProfiles() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = debouncedSearch
        ? await studentService.search({ query: debouncedSearch, page: 0, size: PAGE_SIZE })
        : await studentService.list({ page: 0, size: PAGE_SIZE });
      setStudents(result?.content || []);
    } catch (err) {
      setError(err?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { reload(); }, [reload]);

  // When a student is selected, fetch their fee history
  useEffect(() => {
    if (!selected) { setStudentFees([]); return; }
    let cancelled = false;
    setFeesLoading(true);
    feesService.byStudent(selected.id)
      .then((data) => { if (!cancelled) setStudentFees(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) toast.error("Couldn't load this student's fee history."); })
      .finally(() => { if (!cancelled) setFeesLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const sorted = useMemo(() => {
    const copy = [...students];
    copy.sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "room") return String(a.roomNumber || "").localeCompare(String(b.roomNumber || ""));
      if (sortBy === "fees") return (a.feesStatus || "").localeCompare(b.feesStatus || "");
      return 0;
    });
    return copy;
  }, [students, sortBy]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Student profiles</h1>
        <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
          Browse student records and view fee history.
          {!loading && ` ${students.length} student${students.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          style={{ ...inputStyle(t), minWidth: 240, flex: "1 1 240px" }}
          aria-label="Search student profiles"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyle(t)} aria-label="Sort by">
          <option value="name">Sort by name</option>
          <option value="room">Sort by room</option>
          <option value="fees">Sort by fees</option>
        </select>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={reload} style={linkButton}>Retry</button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={5} />
      ) : sorted.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: t.muted, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
            No students{debouncedSearch ? " match this search" : ""}
          </div>
          <div style={{ fontSize: 13 }}>
            {debouncedSearch ? "Try a different query." : "Once students are added on the Students page, they'll appear here."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {sorted.map((s) => {
            const tone = FEES_TONE[s.feesStatus] || FEES_TONE.PENDING;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s)}
                style={{
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 14,
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  cursor: "pointer",
                  transition: "border-color 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                    {initials(s.name)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, color: t.text, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    {s.email && <div style={{ fontSize: 11, color: t.muted, overflow: "hidden", textOverflow: "ellipsis" }}>{s.email}</div>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: t.muted }}>
                  {s.rollNumber && <div>Roll: <strong style={{ color: t.text }}>{s.rollNumber}</strong></div>}
                  {s.course && <div>Course: <strong style={{ color: t.text }}>{s.course}</strong>{s.year ? ` (Year ${s.year})` : ""}</div>}
                  {s.roomNumber && <div>Room: <strong style={{ color: t.text }}>{s.roomNumber}</strong></div>}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
                  <span style={badge(tone.color)}>{tone.label}</span>
                  {!s.isActive && <span style={{ fontSize: 11, color: t.muted }}>Inactive</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected student modal-like sidebar */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(420px, 100%)", height: "100vh", background: t.surface, borderLeft: `1px solid ${t.border}`, padding: 24, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
                  {initials(selected.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: t.text }}>{selected.name}</h2>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{selected.email}</div>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" style={{ ...secondaryButton(t), padding: "6px 12px" }}>×</button>
            </div>

            <DetailGrid t={t} student={selected} />

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "20px 0 10px", color: t.text }}>Fee history</h3>
            {feesLoading ? (
              <LoadingSkeleton count={2} />
            ) : studentFees.length === 0 ? (
              <div style={{ padding: 12, fontSize: 12, color: t.muted, background: t.bg, borderRadius: 10, border: `1px dashed ${t.border}` }}>
                No fee records on file.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {studentFees.map((f) => {
                  const tone = FEES_TONE[f.paymentStatus] || FEES_TONE.PENDING;
                  return (
                    <div key={f.id} style={{ padding: 12, background: t.bg, border: `1px solid ${t.border}`, borderLeft: `3px solid ${tone.color}`, borderRadius: 10, fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <strong style={{ color: t.text, fontSize: 13 }}>₹ {Number(f.amount || 0).toLocaleString()}</strong>
                        <span style={badge(tone.color)}>{tone.label}</span>
                      </div>
                      <div style={{ color: t.muted }}>
                        {f.feeType && <>{f.feeType}{f.semester ? ` · ${f.semester}` : ""} · </>}
                        Due {f.dueDate || "—"}
                        {f.paymentDate && <> · Paid {f.paymentDate}</>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailGrid({ t, student }) {
  const rows = [
    ["Roll number", student.rollNumber],
    ["Course", student.course],
    ["Department", student.department],
    ["Year", student.year],
    ["Room number", student.roomNumber],
    ["Bed number", student.bedNumber],
    ["Phone", student.phone],
    ["Gender", student.gender],
    ["Blood group", student.bloodGroup],
    ["Date of birth", student.dateOfBirth],
    ["Admission date", student.admissionDate],
    ["Guardian", student.guardianName],
    ["Guardian phone", student.guardianPhone],
    ["Address", student.address],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {rows.filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => (
        <div key={k} style={{ background: t.bg, borderRadius: 8, padding: "8px 10px", border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: t.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</div>
          <div style={{ fontSize: 13, color: t.text, marginTop: 2, wordBreak: "break-word" }}>{String(v)}</div>
        </div>
      ))}
    </div>
  );
}

function inputStyle(t) { return { padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, outline: "none" }; }
function secondaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }; }
function badge(color) { return { display: "inline-block", padding: "2px 10px", fontSize: 10, fontWeight: 700, borderRadius: 999, color, background: `${color}22`, border: `1px solid ${color}55` }; }

const errorBanner = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkButton = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };
