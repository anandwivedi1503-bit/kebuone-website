import { BadgeCheck, Clock, KeyRound, Shield, Smartphone } from "lucide-react";

const items = [
  { icon: Shield, label: "GST invoice on rent", tone: "bg-[#18B368]" },
  { icon: BadgeCheck, label: "KYC-verified riders", tone: "bg-[#EC2A8C]" },
  { icon: KeyRound, label: "Hub OTP pickup", tone: "bg-[#F5C400] text-[#111]" },
  { icon: Smartphone, label: "Razorpay UPI & cards", tone: "bg-[#12B5A8]" },
  { icon: Clock, label: "24×7 helpdesk", tone: "bg-[#2874F0]" },
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
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${item.tone}`}
              >
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
