import type { MetadataRoute } from "next";
import { presentFestiveToday } from "@/lib/festiveCalendar";

export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  const campaign = presentFestiveToday();
  const theme = campaign?.logoAccent ?? "#F4C400";
  return {
    name: "EVUDDY | Electric Scooter Rentals",
    short_name: "EVUDDY",
    description:
      "Book EVUDDY electric scooters in minutes. Flexible rentals and Rent to Own across Indian cities.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4C400",
    theme_color: theme,
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