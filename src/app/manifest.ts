import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "حلقة معاهدة القرآن الكريم",
    short_name: "الحلقة",
    description: "منصة إدارة حلقة معاهدة القرآن الكريم",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1B6B4A",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
