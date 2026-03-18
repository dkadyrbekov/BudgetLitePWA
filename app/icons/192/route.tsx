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
          fontSize: 84,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.08)",
            border: "8px solid rgba(255,255,255,0.08)",
          }}
        >
          $
        </div>
      </div>
    ),
    {
      width: 192,
      height: 192,
    },
  );
}
