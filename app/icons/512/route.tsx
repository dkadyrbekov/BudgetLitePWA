import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, #1e293b 0%, #0f172a 55%, #020617 100%)",
          color: "#ffffff",
          fontSize: 188,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 88,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.08)",
            border: "16px solid rgba(255,255,255,0.08)",
          }}
        >
          $
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    },
  );
}
