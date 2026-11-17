import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EVUDDY | Electric Scooter Rentals",
    short_name: "EVUDDY",
    description:
      "Book EVUDDY electric scooters in minutes. Flexible rentals and Rent to Own across Indian cities.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18B368",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}