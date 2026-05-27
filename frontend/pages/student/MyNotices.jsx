import React, { useContext, useEffect, useState, useCallback } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { get } from "../../api/api";
import {
  PageHeader, Panel, Alert, Loading, Button,
  StatusPill, EmptyState, formatDate,
} from "./_meShared";

/**
 * /me/notices — read-only list of active notices for students.
 */
export default function MyNotices() {
  const { t } = useContext(ThemeContext);

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get("/me/notices");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load notices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const sorted = [...rows].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t}
        title="Notices"
        subtitle="Announcements from the hostel administration."
        right={<Button t={t} onClick={reload}>Refresh</Button>} />

      {error && <Alert t={t} kind="danger">{error}</Alert>}

      {loading ? <Loading t={t} /> :
       sorted.length === 0 ? (
        <EmptyState t={t} icon="📢" title="No active notices" subtitle="When the admin posts an announcement, you'll see it here." />
      ) : (
        <Panel t={t}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map(n => (
              <div key={n.id} style={{
                padding: 14, borderRadius: 12,
                border: `1px solid ${t.border}`, background: t.card,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{n.title}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {n.priority && <StatusPill t={t} status={n.priority} />}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {n.content}
                </div>
                <div style={{ fontSize: 11, color: t.muted }}>
                  {n.category && <>{n.category} · </>}
                  Posted {formatDate(n.publishedAt)}
                  {n.expiresAt && <> · Expires {formatDate(n.expiresAt)}</>}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
