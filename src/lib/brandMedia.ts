/** Official EVUDDY yellow/teal scooter stills — never the pink bike or Kebu mascot. */
export const BRAND = {
  film: "/brand/evuddy-ride.mp4",
  rider: "/new-vehicle.jpeg",
  city: "/brand/indian-city-road.png",
  highway: "/brand/scenic-highway.png",
  parked: "/brand/roadside-parked.png",
  houseParked: "/brand/yellow-house-parked.png",
} as const;

/** Cream frame + contain so wheels and body stay in shot (landscape stills in any box). */
export const SCOOTER_FRAME =
  "flex items-center justify-center overflow-hidden bg-[#EDE8DE] p-4";
export const SCOOTER_IMG = "max-h-full max-w-full object-contain object-center";
