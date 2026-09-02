/** Browser Maps key only. Never return a server-only Maps secret to the client. */
export function readBrowserGoogleMapsApiKey() {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
}

export function readGoogleMapsApiKey() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_KEY ||
    ""
  ).trim();
}
