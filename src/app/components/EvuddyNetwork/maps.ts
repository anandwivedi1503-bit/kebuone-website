export function googleMapsUrl(lat: number, lng: number, label?: string) {
  const query = label
    ? `${lat},${lng} (${label})`
    : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function openGoogleMaps(lat: number, lng: number, label?: string) {
  window.open(googleMapsUrl(lat, lng, label), "_blank", "noopener,noreferrer");
}
