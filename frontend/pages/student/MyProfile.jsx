import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { get } from "../../api/api";
import {
  PageHeader, Panel, SectionTitle, Field, Button, Alert, Loading,
} from "./_meShared";

/**
 * /me/profile — student's own Student record (linked to their User).
 * Admin/warden hitting this gets a friendly "no profile" message.
 */
export default function MyProfile() {
  const { t } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get("/me/student");
      setMe(data);
    } catch (err) {
      setError(err?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <Loading t={t} />;

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PageHeader t={t} title="My Profile" subtitle="Your student record." />
        <Alert t={t} kind="danger">{error}</Alert>
        <div>
          <Button t={t} onClick={reload}>Retry</Button>
        </div>
      </div>
    );
  }

  const initials = me?.name
    ? me.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  const fields = [
    { label: "Full name",    value: me?.name },
    { label: "Email",        value: me?.email },
    { label: "Phone",        value: me?.phone },
    { label: "Roll number",  value: me?.rollNumber },
    { label: "Course",       value: me?.course },
    { label: "Department",   value: me?.department },
    { label: "Year",         value: me?.year ? `Year ${me.year}` : "—" },
    { label: "Gender",       value: me?.gender },
    { label: "Date of birth",value: me?.dateOfBirth },
    { label: "Blood group",  value: me?.bloodGroup },
    { label: "Address",      value: me?.address },
    { label: "Admission",    value: me?.admissionDate },
    { label: "Guardian",     value: me?.guardianName },
    { label: "Guardian phone", value: me?.guardianPhone },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t}
        title="My Profile"
        subtitle="Your hostel registration record."
        right={<Button t={t} onClick={reload}>Refresh</Button>} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(260px, 1fr) minmax(0, 2fr)",
        gap: 24, alignItems: "flex-start",
      }}>
        <Panel t={t}>
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", gap: 14, padding: "8px 4px",
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 36, fontWeight: 700,
            }}>{initials}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>{me?.name}</div>
              <div style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>{me?.email}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 12px",
              borderRadius: 8, letterSpacing: 0.4, textTransform: "uppercase",
              background: `${t.success}22`, color: t.success,
            }}>Student</span>

            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
              <Button t={t} onClick={() => navigate("/me/room")}>My Room</Button>
              <Button t={t} variant="primary" onClick={() => navigate("/settings")}>Change password</Button>
            </div>
          </div>
        </Panel>

        <Panel t={t}>
          <SectionTitle t={t}>Personal information</SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}>
            {fields.map(f => <Field key={f.label} t={t} label={f.label} value={f.value} />)}
          </div>
          <div style={{ fontSize: 12, color: t.muted }}>
            Need a change? Ask the hostel admin to update your record.
          </div>
        </Panel>
      </div>
    </div>
  );
}
