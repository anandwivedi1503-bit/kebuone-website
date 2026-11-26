"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Info, MapPin, ShieldCheck } from "lucide-react";

import {
  FLEET_APPLICANT_PROFILES,
  FLEET_SIZE_OPTIONS,
  FLEET_VEHICLE_PLANS,
  fleetInvestmentEstimate,
  formatFleetRupees,
  type FleetVehiclePlan,
} from "@/lib/fleetInvestment";
import { PREMIUM_BTN, PREMIUM_LABEL, PREMIUM_SELECT, VoiceField } from "../FormVoice/FormVoiceDock";

const INITIAL_FORM = {
  fullName: "",
  phone: "",
  email: "",
  applicantProfile: "",
  vehiclePlan: "" as FleetVehiclePlan | "",
  fleetSize: "5",
  consentAccepted: false,
};

const OPERATIONS_LOCATION = "Lucknow, Uttar Pradesh";

export default function PartnerForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");

  const estimate = formData.vehiclePlan
    ? fleetInvestmentEstimate(formData.vehiclePlan, Number(formData.fleetSize))
    : null;

  const set = (name: keyof typeof INITIAL_FORM, value: string | boolean) =>
    setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormStatus("");
    setFormError("");

    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          partnerType: "Fleet Partner Investment",
          applicantProfile: formData.applicantProfile,
          vehicleCategory: formData.vehiclePlan,
          fleetSize: Number(formData.fleetSize),
          consentAccepted: formData.consentAccepted,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setFormError(data.errors?.join(" ") || data.message || "Submission failed. Please try again.");
        return;
      }

      setFormStatus("Application received. Our fleet partnerships team will contact you shortly.");
      setFormData(INITIAL_FORM);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="partner-form" className="scroll-mt-28 bg-[#F5F7F3] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#16834A]">
            EVUDDY fleet partner program
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#101B31] sm:text-5xl">
            Tell us about your fleet plan
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#59665E] sm:text-base">
            Choose a scooter plan and fleet size from the official investment brief. We&apos;ll contact you to discuss the agreement and next steps.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[30px] border border-[#DFE8DF] bg-white shadow-[0_28px_80px_rgba(16,27,49,0.08)]">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="mb-7 flex items-start gap-3 rounded-2xl bg-[#F2F8F2] p-4">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#16834A]" />
                <p className="text-sm leading-6 text-[#405448]">
                  <span className="font-semibold text-[#172B20]">Initial fleet operations: {OPERATIONS_LOCATION}.</span>
                  <br />
                  You can apply from anywhere; this application is for the current EVUDDY operating city.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <VoiceField
                  label="Full name *"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(value) => set("fullName", value)}
                  placeholder="Your name"
                />
                <VoiceField
                  label="Mobile number *"
                  required
                  type="tel"
                  inputMode="numeric"
                  numeric
                  maxDigits={10}
                  autoComplete="tel-national"
                  leading={<><span>🇮🇳</span> +91</>}
                  value={formData.phone}
                  onChange={(value) => set("phone", value)}
                  placeholder="10-digit number"
                />
                <VoiceField
                  label="Email address *"
                  required
                  type="email"
                  autoComplete="email"
                  className="sm:col-span-2"
                  value={formData.email}
                  onChange={(value) => set("email", value)}
                  placeholder="you@example.com"
                />

                <label className="block sm:col-span-2">
                  <span className={PREMIUM_LABEL}>Which best describes you? *</span>
                  <select
                    required
                    value={formData.applicantProfile}
                    onChange={(event) => set("applicantProfile", event.target.value)}
                    className={PREMIUM_SELECT}
                  >
                    <option value="">Choose your profile</option>
                    {FLEET_APPLICANT_PROFILES.map((profile) => (
                      <option key={profile} value={profile}>{profile}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={PREMIUM_LABEL}>Scooter plan *</span>
                  <select
                    required
                    value={formData.vehiclePlan}
                    onChange={(event) => set("vehiclePlan", event.target.value as FleetVehiclePlan | "")}
                    className={PREMIUM_SELECT}
                  >
                    <option value="">Select a plan</option>
                    {(Object.keys(FLEET_VEHICLE_PLANS) as FleetVehiclePlan[]).map((plan) => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={PREMIUM_LABEL}>Fleet size *</span>
                  <select
                    required
                    value={formData.fleetSize}
                    onChange={(event) => set("fleetSize", event.target.value)}
                    className={PREMIUM_SELECT}
                  >
                    {FLEET_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size} scooters</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-7 flex items-start gap-3 text-sm leading-6 text-[#58655D]">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#16834A]"
                  checked={formData.consentAccepted}
                  onChange={(event) => set("consentAccepted", event.target.checked)}
                  required
                />
                <span>I agree that EVUDDY may contact me about this fleet partner application.</span>
              </label>

              {formError ? <p role="alert" className="mt-4 text-sm font-medium text-red-700">{formError}</p> : null}
              {formStatus ? <p role="status" className="mt-4 text-sm font-medium text-[#147A45]">{formStatus}</p> : null}

              <button type="submit" disabled={loading} className={`${PREMIUM_BTN} mt-6`}>
                {loading ? "Sending application…" : "Send fleet partner application"}
                {!loading ? <ArrowRight size={17} /> : null}
              </button>
            </div>

            <aside className="relative overflow-hidden bg-[#101B31] p-5 text-white sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FFD229]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#18B368]/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A8F0C2]">
                  <ShieldCheck size={16} /> Official brief estimate
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  Your selected plan
                </h3>
                {estimate && formData.vehiclePlan ? (
                  <>
                    <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Indicative investment</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-[#FFD229] sm:text-4xl">
                        {formatFleetRupees(estimate.investment)}
                      </p>
                      <p className="mt-2 text-sm text-white/70">
                        {formData.fleetSize} × {formatFleetRupees(FLEET_VEHICLE_PLANS[formData.vehiclePlan].perScooter)} per scooter
                      </p>
                    </div>
                    <div className="mt-3 flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4">
                      <Check size={17} className="mt-0.5 shrink-0 text-[#72E49A]" />
                      <div>
                        <p className="text-sm font-semibold">EVUDDY operates the fleet</p>
                        <p className="mt-1 text-xs leading-5 text-white/65">The official brief describes the FOCO model: partner owns the fleet; EVUDDY handles operations.</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl border border-[#A8F0C2]/20 bg-[#A8F0C2]/[0.08] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#B8EDC8]">Indicative monthly return in brief</p>
                      <p className="mt-1 text-xl font-bold text-white">{formatFleetRupees(estimate.indicativeMonthlyReturn)}</p>
                      <p className="mt-1 text-[11px] leading-5 text-white/60">Proportional estimate; subject to the final agreement.</p>
                    </div>
                  </>
                ) : (
                  <div className="mt-7 rounded-2xl border border-dashed border-white/20 bg-white/[0.05] p-5">
                    <p className="text-sm font-medium text-white/85">Choose a scooter plan to see the investment amount.</p>
                    <p className="mt-2 text-xs leading-5 text-white/55">The minimum fleet is 5 scooters. All sizes match the published brief.</p>
                  </div>
                )}

                <div className="mt-6 flex items-start gap-2 text-[11px] leading-5 text-white/55">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <p>Indicative figures from the official PDF. Any returns shown in that brief are not guaranteed and remain subject to the final Fleet Partner Agreement. No payment is collected through this form.</p>
                </div>
                <a
                  href="/fleet-partner-investment.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#FFE174] underline decoration-white/30 underline-offset-4 hover:decoration-white"
                >
                  Read the official investment brief <ArrowRight size={15} />
                </a>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </section>
  );
}
