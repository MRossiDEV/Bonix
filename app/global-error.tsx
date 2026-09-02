"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#121212",
          color: "#FAFAFA",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              margin: 0,
            }}
          >
            Critical error
          </p>
          <h1 style={{ marginTop: 16, fontSize: 28, fontWeight: 600 }}>
            The app could not start
          </h1>
          <p style={{ marginTop: 12, fontSize: 14, color: "#9CA3AF" }}>
            Something went wrong before the page could render. Please try again.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#6B7280",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 32,
              padding: "12px 24px",
              borderRadius: 16,
              border: "none",
              backgroundColor: "#FF7A00",
              color: "#121212",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
