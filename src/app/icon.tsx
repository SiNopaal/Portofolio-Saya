import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c16",
          borderRadius: "8px",
          border: "1.5px solid #06b6d4",
        }}
      >
        <span
          style={{
            fontSize: "17px",
            fontWeight: 900,
            background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
            backgroundClip: "text",
            color: "transparent",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-1px",
            lineHeight: 1,
            display: "flex",
          }}
        >
          N
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
