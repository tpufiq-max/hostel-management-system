import React, { useContext, useEffect, useState, useCallback } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { get, post } from "../../api/api";
import {
  PageHeader, Panel, SectionTitle, Alert, Loading, Button,
  StatusPill, EmptyState, Input, Textarea, Select, formatDate,
} from "./_meShared";

const CATEGORY_OPTIONS = [
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING",   label: "Plumbing" },
  { value: "FURNITURE",  label: "Furniture" },
  { value: "APPLIANCE",  label: "Appliance" },
  { value: "CLEANING",   label: "Cleaning" },
  { value: "STRUCTURAL", label: "Structural" },
  { value: "OTHER",      label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW",    label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH",   label: "High" },
  { value: "URGENT", label: "Urgent" },
];

/**
 * /me/maintenance — student-side maintenance ticketing.
 */
export default function MyMaintenance() {
  const { t } = useContext(ThemeContext);

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "ELECTRICAL", priority: "MEDIUM", roomNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get("/me/maintenance");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load maintenance tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    if (!form.title.trim()) {
      setMsg({ kind: "danger", text: "Please add a title." });
      return;
    }
    setSubmitting(true);
    try {
      await post("/me/maintenance", {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        roomNumber: form.roomNumber.trim() || undefined,
      });
      setMsg({ kind: "success", text: "Maintenance ticket submitted." });
      setForm({ title: "", description: "", category: "ELECTRICAL", priority: "MEDIUM", roomNumber: "" });
      reload();
    } catch (err) {
      setMsg({ kind: "danger", text: err?.message || "Failed to submit." });
    } finally {
      setSubmitting(false);
    }
  }

  const sorted = [...rows].sort((a, b) => (a.reportedDate < b.reportedDate ? 1 : -1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t} title="My Maintenance" subtitle="Report problems with your room or fixtures." />

      {error && <Alert t={t} kind="danger">{error}</Alert>}

      <Panel t={t}>
        <SectionTitle t={t}>Report an issue</SectionTitle>
        {msg && <Alert t={t} kind={msg.kind}>{msg.text}</Alert>}
        <form onSubmit={handleSubmit} style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}>
          <Input t={t} required label="Title"
                 value={form.title}
                 onChange={v => setForm(f => ({ ...f, title: v }))} />
          <Select t={t} label="Category"
                  value={form.category}
                  onChange={v => setForm(f => ({ ...f, category: v }))}
                  options={CATEGORY_OPTIONS} />
          <Select t={t} label="Priority"
                  value={form.priority}
                  onChange={v => setForm(f => ({ ...f, priority: v }))}
                  options={PRIORITY_OPTIONS} />
          <Input t={t} label="Room number (optional)"
                 value={form.roomNumber}
                 onChange={v => setForm(f => ({ ...f, roomNumber: v }))} />
          <div style={{ gridColumn: "1 / -1" }}>
            <Textarea t={t} rows={3} label="Description"
                      value={form.description}
                      onChange={v => setForm(f => ({ ...f, description: v }))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Button t={t} variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit ticket"}
            </Button>
          </div>
        </form>
      </Panel>

      {loading ? <Loading t={t} /> :
       sorted.length === 0 ? (
        <EmptyState t={t} icon="🔧" title="No maintenance tickets" subtitle="Submit one above and the hostel team will pick it up." />
      ) : (
        <Panel t={t}>
          <SectionTitle t={t}>Your tickets</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map(r => (
              <div key={r.id} style={{
                padding: 14, borderRadius: 12,
                border: `1px solid ${t.border}`, background: t.card,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{r.title}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <StatusPill t={t} status={r.priority} />
                    <StatusPill t={t} status={r.status} />
                  </div>
                </div>
                {r.description && (
                  <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.5 }}>{r.description}</div>
                )}
                <div style={{ fontSize: 11, color: t.muted }}>
                  {r.category && <>Category: <strong>{r.category}</strong> · </>}
                  {r.roomNumber && <>Room {r.roomNumber} · </>}
                  Reported {formatDate(r.reportedDate)}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
