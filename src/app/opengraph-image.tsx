import { ImageResponse } from "next/og";

export const alt = "Hooklore — A Curated Library of Crochet Patterns";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #faf3ee 0%, #f3e2d6 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 32 }}>
          <circle cx="16" cy="16" r="15" fill="#ffffff" stroke="#b85c3c" strokeWidth="1.5" />
          <path
            d="M 16 25 L 16 12 Q 16 8 12.5 8 Q 10 8 10 10.5"
            stroke="#a14a2e"
            strokeWidth="2.25"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="16" cy="25" r="1.4" fill="#a14a2e" />
        </svg>
        <div
          style={{
            fontSize: 128,
            fontWeight: 500,
            color: "#3f1c13",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Hooklore
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#823a26",
            marginTop: 24,
            fontStyle: "italic",
          }}
        >
          Stitching stories, one loop at a time.
        </div>
      </div>
    ),
    { ...size }
  );
}
