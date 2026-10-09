import { ImageResponse } from "next/og";

export const alt = "Naufal Maulana Izzuddin — Frontend Engineer & AI Automations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0b0e18",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(6,182,212,0.25)",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.2)",
            filter: "blur(120px)",
          }}
        />
        <div style={{ fontSize: 24, color: "#38bdf8", letterSpacing: 8, fontWeight: 700 }}>
          FRONTEND · WEB · AI AUTOMATIONS · UI/UX
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            marginTop: 16,
            background: "linear-gradient(90deg,#38bdf8,#818cf8,#34d399)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Naufal Maulana
        </div>
        <div style={{ fontSize: 32, color: "#cbd5e1", marginTop: 20 }}>
          Crafting high-performance web applications, modern interfaces,
        </div>
        <div style={{ fontSize: 32, color: "#94a3b8" }}>
          and intelligent AI-powered automation workflows.
        </div>
      </div>
    ),
    { ...size }
  );
}
