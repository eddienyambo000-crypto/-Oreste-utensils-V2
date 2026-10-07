import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/constants";

// The storefront app. The admin has its own manifest (public/admin.webmanifest)
// so the owner can install it as a separate home-screen app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${BUSINESS.name} — Kitchenware, Kigali`,
    short_name: BUSINESS.name,
    description: BUSINESS.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf6f0",
    theme_color: "#faf6f0",
    icons: [
      { src: "/icons/store-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/store-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/store-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
