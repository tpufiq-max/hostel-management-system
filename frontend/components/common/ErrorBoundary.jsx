import React from "react";

/**
 * ErrorBoundary — catches render-time errors anywhere below it and
 * displays a recoverable fallback UI instead of a blank screen.
 *
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
    this.setState({ info });
  }

  handleReset() {
    this.setState({ hasError: false, error: null, info: null });
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, info } = this.state;
    const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "'Inter', system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(248,113,113,0.15)",
                color: "var(--danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              !
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                Something went wrong
              </h1>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                The page hit an unexpected error. You can try again.
              </p>
            </div>
          </div>

          {isDev && error && (
            <pre
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                fontSize: 12,
                lineHeight: 1.5,
                color: "var(--danger)",
                overflow: "auto",
                maxHeight: 240,
                marginTop: 12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {String(error?.stack || error?.message || error)}
              {info?.componentStack && `\n\nComponent stack:${info.componentStack}`}
            </pre>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
