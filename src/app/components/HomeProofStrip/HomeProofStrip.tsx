const proofs = [
  { label: "Hub OTP pickup", text: "First payment issues Pickup OTP. Yard unlocks the scooter." },
  { label: "Razorpay + GST", text: "Invoices on rent. Ride end only when remaining is ₹0." },
  { label: "IoT locked fleet", text: "GPS, lock and battery on every scooter in the yard." },
  { label: "Wallet deposit", text: "Security deposit held until return. Rent to Own has none." },
];

export default function HomeProofStrip() {
  return (
    <section
      aria-label="How EVUDDY operates"
      className="bg-white"
    >
      <div className="mx-auto grid max-w-[1440px] gap-px border-b border-[#0A1134]/8 bg-[#0A1134]/8 sm:grid-cols-2 lg:grid-cols-4">
        {proofs.map((item) => (
          <div key={item.label} className="bg-white px-6 py-7 sm:px-8 sm:py-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#18B368]">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
