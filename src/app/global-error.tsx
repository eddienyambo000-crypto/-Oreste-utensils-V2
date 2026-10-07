"use client";

/**
 * Last-resort boundary: replaces the root layout if it (or a provider) throws,
 * so a crash shows a branded page instead of a white screen. Must render its
 * own <html>/<body> and can't use globals.css — hence inline styles.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf6f0",
          color: "#211c15",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "30rem" }}>
          <p
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#a5552a",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Oreste Utensils
          </p>
          <h1 style={{ fontSize: "1.7rem", margin: "0.75rem 0 0.5rem" }}>
            Something went wrong.
          </h1>
          <p style={{ color: "#5d564a", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
            An unexpected error occurred. Please try again — if it keeps
            happening, reach us on WhatsApp at +250&nbsp;783&nbsp;399&nbsp;163.
          </p>
          <button
            onClick={reset}
            style={{
              cursor: "pointer",
              border: "none",
              background: "#a5552a",
              color: "#fff",
              borderRadius: "999px",
              padding: "0.8rem 1.9rem",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
