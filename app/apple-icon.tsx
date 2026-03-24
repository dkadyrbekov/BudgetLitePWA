import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180,
};

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
          background: "#111111",
          borderRadius: 38,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: 74,
          }}
        >
          <div
            style={{
              height: 14,
              width: 74,
              borderRadius: 999,
              background: "white",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: 52,
            }}
          >
            <div
              style={{
                width: 16,
                height: 34,
                borderRadius: 10,
                background: "#f4b740",
              }}
            />
            <div
              style={{
                width: 16,
                height: 46,
                borderRadius: 10,
                background: "#ffffff",
              }}
            />
            <div
              style={{
                width: 16,
                height: 24,
                borderRadius: 10,
                background: "#ff8d5d",
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
