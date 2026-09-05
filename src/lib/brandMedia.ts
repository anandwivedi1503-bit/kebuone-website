/** Official EVUDDY yellow/teal scooter stills — never the pink bike or Kebu mascot. */
export const BRAND = {
  film: "/brand/evuddy-ride.mp4",
  rider: "/new-vehicle.jpeg",
  city: "/brand/indian-city-road.png",
  highway: "/brand/scenic-highway.png",
  parked: "/brand/roadside-parked.png",
  houseParked: "/brand/yellow-house-parked.png",
  register: "/brand/scene-register-kyc.png",
  pay: "/brand/scene-pay-book.png",
  yard: "/brand/scene-yard-hub.png",
  charge: "/brand/scene-charge.png",
  franchise: "/brand/scene-franchise.png",
  dealer: "/brand/scene-dealer.png",
  distributor: "/brand/scene-distributor.png",
} as const;

/** Cream frame + contain so wheels and body stay in shot. */
export const SCOOTER_FRAME =
  "flex items-center justify-center overflow-hidden bg-[#EDE8DE] p-4";
export const SCOOTER_IMG = "max-h-full max-w-full object-contain object-center";
