/** Official yellow + teal EVUDDY scooter (brand photo). */
export const BRAND_SCOOTER_PHOTO = "/evuddy-brand-scooter.png";

/** Legacy PNG cutouts — fallback only; photo is canonical. */
export const YELLOW_SCOOTER_CUTOUT = BRAND_SCOOTER_PHOTO;
export const YELLOW_SCOOTER_SIDE = "/evuddy-side.png";
export const YELLOW_SCOOTER_PRODUCT = "/evuddy-scooter.png";
export const YELLOW_SCOOTER_HUB = "/brand/yellow-house-parked.png";

export const YELLOW_SCOOTER_CANDIDATES = [
  BRAND_SCOOTER_PHOTO,
  YELLOW_SCOOTER_HUB,
  YELLOW_SCOOTER_SIDE,
  YELLOW_SCOOTER_PRODUCT,
] as const;
