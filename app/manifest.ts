import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Budget Lite",
    short_name: "Budget",
    description: "A mobile-first personal budget app.",
    start_url: "/expenses",
    display: "standalone",
    background_color: "#e2e8f0",
    theme_color: "#0f172a",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
