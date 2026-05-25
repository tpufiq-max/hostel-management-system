import React from "react";
import Notification from "./Notification";

export default function NotificationContainer({ notifications = [], onRemove }) {
  if (!notifications.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {notifications.map((n) => (
        <div key={n.id} style={{ pointerEvents: "auto" }}>
          <Notification notification={n} onClose={() => onRemove(n.id)} />
        </div>
      ))}
    </div>
  );
}
