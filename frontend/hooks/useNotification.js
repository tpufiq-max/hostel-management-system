/**
 * Backwards-compatible re-export.
 * The real implementation lives in context/NotificationContext.jsx.
 *
 *   import { useNotification } from "../hooks/useNotification";
 *   const toast = useNotification();
 *   toast.success("Saved!");
 */
export { useNotification } from "../context/NotificationContext";
