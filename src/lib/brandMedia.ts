import { BRAND_SCOOTER_PHOTO } from "./scooterAssets";

/** Official EVUDDY yellow/teal scooter stills — never the pink bike or Kebu mascot. */
export const BRAND = {
  film: "/brand/evuddy-ride.mp4",
  filmPoster: "/brand/scene-film-poster.png",
  rider: BRAND_SCOOTER_PHOTO,
  city: "/brand/scene-city-front.png",
  cityCommute: "/brand/scene-city-front.png",
  afterWork: "/brand/scene-after-front.png",
  highway: "/brand/scenic-highway.png",
  range: "/brand/scene-range-16x9.png",
  parked: "/brand/roadside-parked.png",
  houseParked: "/brand/yellow-house-parked.png",
  register: "/brand/scene-register-kyc.png",
  pay: "/brand/scene-pay-book.png",
  yard: "/brand/evuddy-hub-pickup.jpg",
  pickup: "/brand/evuddy-hub-pickup.jpg",
  franchise: "/brand/scene-franchise.png",
  dealer: "/brand/scene-dealer-showroom.png",
  distributor: "/brand/scene-distributor-warehouse.png",
} as const;

export const SCOOTER_FRAME = "overflow-hidden bg-[#EDE8DE]";
export const SCOOTER_IMG = "h-full w-full object-contain object-center";
