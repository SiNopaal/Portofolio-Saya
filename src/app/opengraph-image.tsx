import { ImageResponse } from "next/og";

export const alt = "Naufal Ananta — Backend & AI Engineer";
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
          background: "#090909",
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
            background: "rgba(139,92,246,0.25)",
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
        <div style={{ fontSize: 24, color: "#a78bfa", letterSpacing: 8 }}>
          BACKEND · AI · OPEN SOURCE
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            marginTop: 16,
            background: "linear-gradient(90deg,#a78bfa,#60a5fa,#fb923c)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Naufal Ananta
        </div>
        <div style={{ fontSize: 32, color: "#a3a3a3", marginTop: 20 }}>
          Building scalable backend systems, microservices,
        </div>
        <div style={{ fontSize: 32, color: "#a3a3a3" }}>
          cloud infrastructure & AI-powered applications.
        </div>
      </div>
    ),
    { ...size }
  );
}
