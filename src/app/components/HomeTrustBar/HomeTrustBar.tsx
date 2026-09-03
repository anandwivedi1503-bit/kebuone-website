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
      className="relative z-10 border-y border-[#18B368]/15 bg-[#F7FBFA]"
    >
      <div className="mx-auto flex max-w-[1480px] snap-x items-stretch gap-0 overflow-x-auto px-2 py-4 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-6 lg:px-10">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex min-w-[200px] snap-start items-center gap-3 px-5 py-2 sm:min-w-0 ${
                i > 0 ? "sm:border-l sm:border-[#18B368]/15" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#18B368] text-white">
                <Icon size={16} />
              </span>
              <p className="text-sm font-semibold leading-5 text-[#0F172A]">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
