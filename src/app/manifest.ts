import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.name} — Premium Kitchenware, Kigali`,
    short_name: BUSINESS.name,
    description: BUSINESS.description,
    start_url: "/",
    display: "standalone",
    background_color: "#faf6f0",
    theme_color: "#a5552a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
