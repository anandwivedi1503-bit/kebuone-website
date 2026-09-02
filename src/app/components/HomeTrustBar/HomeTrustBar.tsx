import { BadgeCheck, Clock, KeyRound, Shield, Smartphone } from "lucide-react";

const items = [
  { icon: Shield, label: "GST invoice on rent" },
  { icon: BadgeCheck, label: "KYC-verified riders" },
  { icon: KeyRound, label: "Hub OTP pickup" },
  { icon: Smartphone, label: "Razorpay UPI & cards" },
  { icon: Clock, label: "24×7 helpdesk" },
];

export default function HomeTrustBar() {
  return (
    <section
      aria-label="Why riders trust EVUDDY"
      className="relative z-10 border-y border-slate-100 bg-white"
    >
      <div className="mx-auto flex max-w-[1480px] snap-x gap-3 overflow-x-auto px-4 py-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-6 lg:px-10">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex min-w-[220px] snap-start items-center gap-3 rounded-2xl border border-slate-100 bg-[#F7FBF8] px-4 py-3 sm:min-w-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#18B368] text-white">
                <Icon size={18} />
              </span>
              <p className="text-sm font-bold leading-5 text-[#0F172A]">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
