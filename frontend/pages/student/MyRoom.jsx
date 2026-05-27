import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { get } from "../../api/api";
import { PageHeader, Panel, SectionTitle, Field, Alert, Loading, Button, EmptyState } from "./_meShared";

/**
 * /me/room — the student's own room allocation, scoped server-side.
 */
export default function MyRoom() {
  const { t } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await get("/me/room");
      setData(r);
    } catch (err) {
      setError(err?.message || "Failed to load room details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <Loading t={t} />;

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PageHeader t={t} title="My Room" subtitle="Your hostel allocation." />
        <Alert t={t} kind="danger">{error}</Alert>
      </div>
    );
  }

  const allocated = !!(data?.roomNumber || data?.roomId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t}
        title="My Room"
        subtitle={allocated ? "Your hostel allocation." : "You have not been allocated a room yet."}
        right={<Button t={t} onClick={reload}>Refresh</Button>} />

      {!allocated ? (
        <EmptyState t={t}
          icon="🚪"
          title="No room allocated"
          subtitle="The hostel administrator will assign your room shortly."
          action={<Button t={t} variant="primary" onClick={() => navigate("/me/complaints")}>Contact admin</Button>} />
      ) : (
        <Panel t={t}>
          <SectionTitle t={t}>Allocation</SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}>
            <Field t={t} label="Room number" value={data?.roomNumber} />
            <Field t={t} label="Bed number"  value={data?.bedNumber} />
            <Field t={t} label="Block"       value={data?.block} />
            <Field t={t} label="Floor"       value={data?.floor != null ? `Floor ${data.floor}` : null} />
            <Field t={t} label="Type"        value={data?.type} />
            <Field t={t} label="Capacity"    value={data?.capacity ? `${data.capacity} occupants` : null} />
          </div>
          <div style={{ fontSize: 12, color: t.muted }}>
            Issues with your room? Submit a complaint or maintenance ticket.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button t={t} onClick={() => navigate("/me/complaints")}>Submit complaint</Button>
            <Button t={t} onClick={() => navigate("/me/maintenance")}>Report maintenance</Button>
          </div>
        </Panel>
      )}
    </div>
  );
}
