import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/constants";

export const alt = `${BUSINESS.name} — Premium Kitchenware in Kigali, Rwanda`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#faf6f0",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontSize: 44, fontWeight: 700, color: "#211c15" }}>
            Oreste
          </span>
          <span
            style={{
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#a5552a",
              fontWeight: 600,
            }}
          >
            Utensils
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#211c15",
            }}
          >
            Everything your
          </span>
          <span
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#a5552a",
              fontStyle: "italic",
            }}
          >
            kitchen deserves.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: "#5d564a",
          }}
        >
          <span>Premium kitchenware · City Plaza, Kigali</span>
          <span style={{ color: "#a5552a", fontWeight: 600 }}>
            Free delivery over 500,000 RWF
          </span>
        </div>
      </div>
    ),
    size,
  );
}
