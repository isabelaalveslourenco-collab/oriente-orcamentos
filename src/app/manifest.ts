import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orçamentos Oriente Móveis",
    short_name: "Oriente Móveis",
    description: "Sistema de orçamentos para móveis planejados e marcenaria — Oriente Móveis",
    start_url: "/novo-orcamento",
    display: "standalone",
    background_color: "#F7F7F7",
    theme_color: "#C1121F",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
