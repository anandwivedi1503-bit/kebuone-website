const proofs = [
  { value: "OTP", label: "Hub pickup", text: "Issued after first payment" },
  { value: "GST", label: "Razorpay bills", text: "Ride end at remaining ₹0" },
  { value: "IoT", label: "Locked fleet", text: "GPS, lock & battery live" },
  { value: "₹", label: "Wallet deposit", text: "Held until return · none on RTO" },
];

export default function HomeProofStrip() {
  return (
    <section aria-label="How EVUDDY operates" className="bg-[#F4F1EA] pb-14 sm:pb-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="overflow-hidden rounded-[28px] border border-[#0A1134]/8 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {proofs.map((item, index) => (
              <div
                key={item.label}
                className={`px-6 py-7 sm:px-8 sm:py-8 ${
                  index < proofs.length - 1
                    ? "border-b border-[#0A1134]/8 sm:border-b-0 lg:border-r"
                    : ""
                } ${index % 2 === 0 ? "sm:border-r lg:border-r" : ""} ${
                  index < 2 ? "sm:border-b lg:border-b-0" : ""
                }`}
              >
                <p className="text-2xl font-medium tracking-[-0.04em] text-[#0A1134]">
                  {item.value}
                </p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#18B368]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
