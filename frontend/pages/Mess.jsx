import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { messService } from "../features/mess/messService";

/* ── Backend enums ─────────────────────────────────────────────── */

const DAYS = [
  { value: "MON", label: "Monday"    },
  { value: "TUE", label: "Tuesday"   },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday"  },
  { value: "FRI", label: "Friday"    },
  { value: "SAT", label: "Saturday"  },
  { value: "SUN", label: "Sunday"    },
];

const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Breakfast", color: "var(--warning)" },
  { value: "LUNCH",     label: "Lunch",     color: "var(--accent)"  },
  { value: "SNACKS",    label: "Snacks",    color: "var(--purple)"  },
  { value: "DINNER",    label: "Dinner",    color: "var(--success)" },
];

const DAY_LABEL  = Object.fromEntries(DAYS.map((d) => [d.value, d.label]));
const MEAL_BY_VALUE = Object.fromEntries(MEAL_TYPES.map((m) => [m.value, m]));

const emptyForm = {
  day: "MON",
  mealType: "BREAKFAST",
  items: "",
  specialNote: "",
  isActive: true,
};

/* ── Page ──────────────────────────────────────────────────────── */

export default function Mess() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dayFilter, setDayFilter] = useState("");
  const [mealFilter, setMealFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The full week is at most 28 entries (7 days x 4 meals); fetch everything once.
      const result = await messService.list({ page: 0, size: 100 });
      setItems(result?.content || []);
    } catch (err) {
      setError(err?.message || "Failed to load mess menu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  /* ── Filtered + grouped view ────────────────────────────────── */

  const filtered = useMemo(() => {
    return items.filter((m) => {
      if (dayFilter && m.day !== dayFilter) return false;
      if (mealFilter && m.mealType !== mealFilter) return false;
      return true;
    });
  }, [items, dayFilter, mealFilter]);

  /** menusByDay[day][mealType] = MessMenuDTO */
  const menusByDay = useMemo(() => {
    const map = {};
    for (const m of filtered) {
      if (!map[m.day]) map[m.day] = {};
      map[m.day][m.mealType] = m;
    }
    return map;
  }, [filtered]);

  /* ── Form handlers ──────────────────────────────────────────── */

  function openCreate(prefill) {
    setEditing(null);
    setForm({ ...emptyForm, ...(prefill || {}) });
    setShowForm(true);
  }

  function openEdit(menu) {
    setEditing(menu);
    setForm({
      day:         menu.day         || "MON",
      mealType:    menu.mealType    || "BREAKFAST",
      items:       menu.items       || "",
      specialNote: menu.specialNote || "",
      isActive:    menu.isActive ?? true,
    });
    setShowForm(true);
  }

  function patch(p) { setForm((f) => ({ ...f, ...p })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.items.trim()) {
      toast.error("Items list is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await messService.update(editing.id, form);
        toast.success("Menu updated.");
      } else {
        await messService.create(form);
        toast.success("Menu added.");
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to save menu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(menu) {
    if (busyId) return;
    if (!window.confirm(`Remove the ${menu.mealType.toLowerCase()} menu for ${DAY_LABEL[menu.day]}?`)) return;
    setBusyId(menu.id);
    try {
      await messService.remove(menu.id);
      toast.success("Menu removed.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to remove menu.");
    } finally {
      setBusyId(null);
    }
  }

  const totalSlots = DAYS.length * MEAL_TYPES.length;
  const filledSlots = items.length;

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>
            Mess management
          </h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Plan and manage the weekly meal schedule.
            {!loading && ` ${filledSlots} of ${totalSlots} slots filled.`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            style={selectStyle(t)}
            aria-label="Filter by day"
          >
            <option value="">All days</option>
            {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value)}
            style={selectStyle(t)}
            aria-label="Filter by meal type"
          >
            <option value="">All meals</option>
            {MEAL_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button type="button" onClick={() => openCreate()} style={primaryButton(t)}>
            + Add menu
          </button>
        </div>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBannerStyle}>
          {error}
          <button type="button" onClick={reload} style={linkButtonStyle}>Retry</button>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <LoadingSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          t={t}
          hasFilter={!!(dayFilter || mealFilter)}
          onClear={() => { setDayFilter(""); setMealFilter(""); }}
          onAdd={() => openCreate()}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DAYS.map((day) => {
            const dayMenus = menusByDay[day.value];
            if (!dayMenus) return null;
            return (
              <div key={day.value} style={panelStyle(t)}>
                <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: t.text }}>
                  {day.label}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  {MEAL_TYPES.map((meal) => {
                    const menu = dayMenus[meal.value];
                    if (!menu && (mealFilter && mealFilter !== meal.value)) return null;
                    if (!menu) {
                      // Empty slot — show as placeholder if no meal filter is set
                      if (mealFilter) return null;
                      return (
                        <button
                          key={meal.value}
                          type="button"
                          onClick={() => openCreate({ day: day.value, mealType: meal.value })}
                          style={emptySlotStyle(t)}
                        >
                          <div style={{ fontSize: 11, color: meal.color, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {meal.label}
                          </div>
                          <div style={{ fontSize: 12, color: t.muted }}>+ Add menu</div>
                        </button>
                      );
                    }
                    return (
                      <MenuCard
                        key={meal.value}
                        menu={menu}
                        meal={meal}
                        t={t}
                        busy={busyId === menu.id}
                        onEdit={() => openEdit(menu)}
                        onDelete={() => handleDelete(menu)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => !submitting && setShowForm(false)}
        title={editing ? "Edit menu" : "Add menu"}
        size="md"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Day" required>
              <select
                value={form.day}
                onChange={(e) => patch({ day: e.target.value })}
                disabled={submitting || !!editing}
                style={inputStyle(t)}
              >
                {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
            <Field label="Meal type" required>
              <select
                value={form.mealType}
                onChange={(e) => patch({ mealType: e.target.value })}
                disabled={submitting || !!editing}
                style={inputStyle(t)}
              >
                {MEAL_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
          </div>

          {!editing && (
            <p style={{ margin: 0, fontSize: 11, color: t.muted, lineHeight: 1.5 }}>
              The backend enforces one menu per (day, meal type) slot. If a menu already exists
              for this slot, you will see an error — edit the existing one instead.
            </p>
          )}

          <Field label="Menu items" required>
            <textarea
              required
              rows={3}
              value={form.items}
              onChange={(e) => patch({ items: e.target.value })}
              placeholder="Idli, Sambar, Coconut Chutney, Tea/Coffee"
              disabled={submitting}
              style={{ ...inputStyle(t), resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>

          <Field label="Special note (optional)">
            <input
              type="text"
              value={form.specialNote}
              onChange={(e) => patch({ specialNote: e.target.value })}
              placeholder="e.g. Special weekend menu"
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
            Active
          </label>

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={submitting}
              style={{ ...secondaryButton(t), flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...primaryButton(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
            >
              {submitting
                ? (editing ? "Updating…" : "Adding…")
                : (editing ? "Update menu" : "Add menu")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function MenuCard({ menu, meal, t, busy, onEdit, onDelete }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderTop: `3px solid ${meal.color}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: menu.isActive ? 1 : 0.6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontSize: 11, color: meal.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {meal.label}{!menu.isActive && <span style={{ color: t.muted, fontWeight: 500, marginLeft: 6 }}>(inactive)</span>}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" onClick={onEdit} disabled={busy} style={tinyButton(t, t.accent)} aria-label="Edit menu">
            Edit
          </button>
          <button type="button" onClick={onDelete} disabled={busy} style={tinyButton(t, "var(--danger)")} aria-label="Delete menu">
            Remove
          </button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: t.text, lineHeight: 1.55 }}>{menu.items}</div>
      {menu.specialNote && (
        <div style={{ fontSize: 11, color: t.muted, fontStyle: "italic" }}>
          {menu.specialNote}
        </div>
      )}
    </div>
  );
}

function EmptyState({ t, hasFilter, onClear, onAdd }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: t.muted, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
        {hasFilter ? "No menus match this filter" : "No menus yet"}
      </div>
      <div style={{ fontSize: 13 }}>
        {hasFilter ? "Try a different day or meal type." : "Add the first menu with the Add menu button."}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {hasFilter && (
          <button type="button" onClick={onClear} style={secondaryButton(t)}>Clear filter</button>
        )}
        <button type="button" onClick={onAdd} style={primaryButton(t)}>+ Add menu</button>
      </div>
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

/* ── Style helpers ─────────────────────────────────────────────── */

function panelStyle(t) {
  return {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 16,
    padding: 18,
  };
}

function emptySlotStyle(t) {
  return {
    padding: 14,
    borderRadius: 12,
    background: "transparent",
    border: `2px dashed ${t.border}`,
    color: t.muted,
    fontSize: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
    minHeight: 90,
  };
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

function selectStyle(t) {
  return {
    ...inputStyle(t),
    width: "auto",
    minWidth: 140,
    paddingRight: 28,
    cursor: "pointer",
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

function tinyButton(t, color) {
  return {
    padding: "5px 10px",
    borderRadius: 8,
    border: `1px solid ${color}55`,
    background: `${color}11`,
    color,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}

const errorBannerStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(248,113,113,0.12)",
  border: "1px solid rgba(248,113,113,0.45)",
  color: "var(--danger)",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const linkButtonStyle = {
  marginLeft: "auto",
  background: "none",
  border: "none",
  color: "var(--danger)",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: 12,
};
