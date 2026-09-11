import type { MetadataRoute } from "next";

const SITE = "https://www.evuddy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    "/",
    "/book-bike",
    "/rent-to-own",
    "/ride-options",
    "/about",
    "/vision",
    "/careers",
    "/contact",
    "/partners",
    "/partners/dealer",
    "/partners/distributor",
    "/register",
    "/privacy-policy",
    "/refund-policy",
    "/terms-and-conditions",
    "/Leadership",
  ];

  return paths.map((path) => ({
    url: `${SITE}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" || path === "/book-bike" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/book-bike" || path === "/rent-to-own" ? 0.9 : 0.6,
  }));
}
