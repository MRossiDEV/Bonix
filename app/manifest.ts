import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bonix",
    short_name: "Bonix",
    description: "Save money where you already eat.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#121212",
    theme_color: "#121212",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "512x512",
      },
    ],
  };
}
