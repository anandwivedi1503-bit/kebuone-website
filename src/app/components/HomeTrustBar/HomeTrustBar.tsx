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
      className="border-y border-[#E4DDD2] bg-[#FBF9F5]"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 py-10 min-[480px]:grid-cols-2 sm:px-8 lg:grid-cols-5 lg:gap-6 lg:px-12">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-3">
              <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#1F6B4A]" />
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#3F463F]">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
