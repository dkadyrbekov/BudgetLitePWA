import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = {
  width: 512,
  height: 512,
};

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
          background:
            "linear-gradient(180deg, rgb(17,17,17) 0%, rgb(54,48,43) 100%)",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.1)",
            border: "8px solid rgba(255,255,255,0.16)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              width: 160,
            }}
          >
            <div
              style={{
                height: 28,
                width: 160,
                borderRadius: 999,
                background: "white",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: 120,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 76,
                  borderRadius: 20,
                  background: "#f4b740",
                }}
              />
              <div
                style={{
                  width: 34,
                  height: 108,
                  borderRadius: 20,
                  background: "#ffffff",
                }}
              />
              <div
                style={{
                  width: 34,
                  height: 58,
                  borderRadius: 20,
                  background: "#ff8d5d",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
