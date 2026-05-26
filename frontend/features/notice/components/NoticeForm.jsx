import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import { useNotification } from "../../../context/NotificationContext";
import { noticeService } from "../noticeService";

const CATEGORIES = [
  { value: "GENERAL",   label: "General"   },
  { value: "ACADEMIC",  label: "Academic"  },
  { value: "HOSTEL",    label: "Hostel"    },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "EVENT",     label: "Event"     },
];

const PRIORITIES = [
  { value: "LOW",    label: "Low"    },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH",   label: "High"   },
  { value: "URGENT", label: "Urgent" },
];

const AUDIENCES = [
  { value: "ALL",      label: "Everyone" },
  { value: "STUDENTS", label: "Students" },
  { value: "STAFF",    label: "Staff"    },
  { value: "WARDENS",  label: "Wardens"  },
];

const emptyForm = {
  title: "",
  content: "",
  category: "GENERAL",
  priority: "NORMAL",
  targetAudience: "ALL",
  publishedBy: "",
  expiresAt: "",
  isActive: true,
};

/** Convert backend ISO datetime ("2026-05-26T03:50:14") to <input type="datetime-local"> value (no timezone). */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert <input type="datetime-local"> value back to ISO-8601 (LocalDateTime, no offset). */
function fromLocalInput(value) {
  if (!value) return null;
  // Backend uses LocalDateTime which expects no timezone suffix; "yyyy-MM-ddTHH:mm" parses fine,
  // but pad seconds to satisfy strict parsers.
  return value.length === 16 ? `${value}:00` : value;
}

export default function NoticeForm({ notice, onSaved, onCancel }) {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (notice) {
      setForm({
        title:          notice.title          || "",
        content:        notice.content        || "",
        category:       notice.category       || "GENERAL",
        priority:       notice.priority       || "NORMAL",
        targetAudience: notice.targetAudience || "ALL",
        publishedBy:    notice.publishedBy    || "",
        expiresAt:      toLocalInput(notice.expiresAt),
        isActive:       notice.isActive ?? true,
      });
    } else {
      setForm(emptyForm);
    }
  }, [notice]);

  function patch(p) { setForm((f) => ({ ...f, ...p })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    const payload = { ...form, expiresAt: fromLocalInput(form.expiresAt) };
    setSubmitting(true);
    try {
      if (notice?.id) {
        await noticeService.update(notice.id, payload);
        toast.success("Notice updated.");
      } else {
        await noticeService.create(payload);
        toast.success("Notice published.");
      }
      onSaved?.();
    } catch (err) {
      toast.error(err?.message || "Failed to save notice.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text, marginBottom: 14 }}>
        {notice ? "Edit notice" : "Publish a notice"}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Title" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Hostel maintenance schedule"
            disabled={submitting}
            style={inputStyle(t)}
          />
        </Field>

        <Field label="Content" required>
          <textarea
            required
            rows={4}
            value={form.content}
            onChange={(e) => patch({ content: e.target.value })}
            placeholder="What do you want to announce?"
            disabled={submitting}
            style={{ ...inputStyle(t), resize: "vertical", fontFamily: "inherit" }}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => patch({ category: e.target.value })}
              disabled={submitting}
              style={inputStyle(t)}
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={form.priority}
              onChange={(e) => patch({ priority: e.target.value })}
              disabled={submitting}
              style={inputStyle(t)}
            >
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Audience">
            <select
              value={form.targetAudience}
              onChange={(e) => patch({ targetAudience: e.target.value })}
              disabled={submitting}
              style={inputStyle(t)}
            >
              {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Field>
          <Field label="Expires at (optional)">
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => patch({ expiresAt: e.target.value })}
              disabled={submitting}
              style={inputStyle(t)}
            />
          </Field>
        </div>

        <Field label="Published by">
          <input
            type="text"
            value={form.publishedBy}
            onChange={(e) => patch({ publishedBy: e.target.value })}
            placeholder="Hostel Office"
            disabled={submitting}
            style={inputStyle(t)}
          />
        </Field>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.text, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => patch({ isActive: e.target.checked })}
            disabled={submitting}
            style={{ width: 16, height: 16 }}
          />
          Active (visible in list)
        </label>

        <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
          {(notice || onCancel) && (
            <button
              type="button"
              onClick={() => onCancel?.()}
              disabled={submitting}
              style={{ ...secondaryButton(t), flex: 1 }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{ ...primaryButton(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
          >
            {submitting
              ? (notice ? "Updating…" : "Publishing…")
              : (notice ? "Update notice" : "Publish notice")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
      {label}{required && <span style={{ color: "var(--danger)" }}> *</span>}
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

function inputStyle(t) {
  return {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.text,
    fontSize: 13,
    outline: "none",
  };
}

function primaryButton(t) {
  return {
    padding: "9px 16px",
    borderRadius: 10,
    border: "none",
    background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: `0 4px 14px ${t.accent}44`,
  };
}

function secondaryButton(t) {
  return {
    padding: "9px 16px",
    borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.text,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}
