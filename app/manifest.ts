import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Study Abroad Consultancy",
    short_name: "SAC",
    description:
      "Dhaka-based guidance for Bangladeshi students applying to China, India, Malaysia, and South Korea.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/icon.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "1089x708",
        type: "image/png",
      },
    ],
  };
}
