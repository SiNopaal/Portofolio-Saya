import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0b1122 0%, #060913 100%)",
          borderRadius: "40px",
          border: "4px solid #06b6d4",
          boxShadow: "0 0 30px rgba(6, 182, 212, 0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "92px",
              fontWeight: 900,
              background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
              backgroundClip: "text",
              color: "transparent",
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            NM
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
