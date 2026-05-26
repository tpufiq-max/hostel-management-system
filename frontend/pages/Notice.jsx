import React, { useContext, useState } from "react";
import NoticeForm from "../features/notice/components/NoticeForm";
import NoticeList from "../features/notice/components/NoticeList";
import { ThemeContext } from "../context/ThemeContext";

/**
 * Notices page — two-column layout.
 *   left:  NoticeForm (create or edit)
 *   right: NoticeList (paginated, filterable)
 *
 * The two communicate through:
 *   - editing: the notice currently being edited (or null for "create")
 *   - refreshKey: bumped after each save/delete so the list refetches
 */
export default function Notice() {
  const { t } = useContext(ThemeContext);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSaved() {
    setEditing(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Notices</h1>
        <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
          Publish announcements and keep students informed.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1.1fr) minmax(0, 1fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <Panel t={t}>
          <NoticeForm
            notice={editing}
            onSaved={handleSaved}
            onCancel={editing ? () => setEditing(null) : undefined}
          />
        </Panel>

        <Panel t={t}>
          <NoticeList
            refreshKey={refreshKey}
            onEdit={(n) => setEditing(n)}
          />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ t, children }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: 20,
      }}
    >
      {children}
    </div>
  );
}
