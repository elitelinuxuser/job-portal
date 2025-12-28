import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "HFree - Wedding Industry Freelancer Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "300px",
            height: "300px",
            background: "rgba(245, 158, 11, 0.15)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: "300px",
            height: "300px",
            background: "rgba(244, 63, 94, 0.15)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50px",
              padding: "8px 20px",
              marginBottom: "24px",
            }}
          >
            <span style={{ color: "#fbbf24", fontSize: "18px" }}>✨</span>
            <span style={{ color: "#fbbf24", fontSize: "18px" }}>
              Built for the Wedding Industry
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              H
            </div>
            <span
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              HFree
            </span>
          </div>

          <p
            style={{
              fontSize: "32px",
              color: "#94a3b8",
              maxWidth: "800px",
              lineHeight: 1.4,
              margin: "0 0 32px 0",
            }}
          >
            Connect with verified wedding photographers, videographers &
            specialists
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)",
              borderRadius: "50px",
              padding: "16px 32px",
            }}
          >
            <span style={{ color: "white", fontSize: "24px", fontWeight: 600 }}>
              🎉 First 100 users get 1 Year FREE
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
