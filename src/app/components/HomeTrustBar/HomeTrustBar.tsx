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
      className="border-y border-white/10 bg-[#06140F]"
    >
      <div className="mx-auto flex max-w-[1440px] snap-x overflow-x-auto px-5 py-5 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-8 lg:px-12">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex min-w-[210px] snap-start items-center gap-3 py-2 sm:min-w-0 ${
                i > 0 ? "sm:border-l sm:border-white/10 sm:pl-6" : ""
              }`}
            >
              <Icon size={16} className="shrink-0 text-[#18B368]" />
              <p className="text-[13px] font-medium tracking-wide text-white/80">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
