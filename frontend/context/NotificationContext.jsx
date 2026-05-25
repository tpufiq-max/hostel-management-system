import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import NotificationContainer from "../components/common/NotificationContainer";

/* ─────────────────────────────────────────────────────────────────
 *  NotificationContext — app-wide toast notifications.
 *  Any component can call:
 *    const toast = useNotification();
 *    toast.success("Saved");
 *    toast.error("Failed", 5000);
 *  ───────────────────────────────────────────────────────────────── */

const NotificationContext = createContext({
  notify: () => 0,
  remove: () => {},
  success: () => 0,
  error: () => 0,
  info: () => 0,
  warning: () => 0,
});

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const success = useCallback((m, d) => notify(m, "success", d), [notify]);
  const error   = useCallback((m, d) => notify(m, "error",   d), [notify]);
  const info    = useCallback((m, d) => notify(m, "info",    d), [notify]);
  const warning = useCallback((m, d) => notify(m, "warning", d), [notify]);

  const value = useMemo(
    () => ({ notify, remove, success, error, info, warning }),
    [notify, remove, success, error, info, warning]
  );

  // Surface session-expired events from api.js as a toast.
  useEffect(() => {
    const onExpired = () => {
      warning("Your session has expired. Please log in again.", 5000);
    };
    window.addEventListener("hms:session-expired", onExpired);
    return () => window.removeEventListener("hms:session-expired", onExpired);
  }, [warning]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={items} onRemove={remove} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}

export default NotificationContext;
