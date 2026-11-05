"use client";

import { useState } from "react";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import {
  ComingThroughChips,
  PREMIUM_BTN,
  PREMIUM_SELECT,
  SpeakAllButton,
  VoiceArea,
  VoiceField,
  VoiceSelect,
} from "../FormVoice/FormVoiceDock";

const selectClass = PREMIUM_SELECT;

const PARTNER_TYPES = [
  "Fleet Partner Investment",
  "EVUDDY Dealer",
  "EVUDDY Distributor",
  "Hub Operations Partner",
  "Delivery Operations Partner",
] as const;

const INVESTMENT_TIERS = [
  "₹1 Lakh · 3 scooters",
  "₹5 Lakh · 15 scooters",
  "₹10 Lakh · 30 scooters",
  "₹5 Lakhs · Dealer (retail)",
  "₹10 Lakhs · Distributor",
  "Below ₹5 Lakhs",
  "₹5 – ₹10 Lakhs",
  "₹10 – ₹25 Lakhs",
  "₹25 – ₹50 Lakhs",
  "₹50 Lakhs+",
] as const;

export default function PartnerForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    partnerType: "Fleet Partner Investment",
    comingThrough: "Direct / EVUDDY",
    investmentCapacity: "",
    message: "",
    consentAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");

  const set = (name: string, value: string | boolean) =>
    setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFormStatus("");
      setFormError("");
      const payload = {
        ...formData,
        organizationName: formData.fullName,
        territory: formData.city,
        propertyAvailable: "No",
        availableSpace: "Below 500 Sq Ft",
        businessExperience: "Fresher",
        plannedFleetSize: "1 - 10 Vehicles",
      };
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFormStatus("Application received. Our partnerships desk will call you on the mobile number above.");
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          state: "",
          city: "",
          partnerType: "Fleet Partner Investment",
          comingThrough: "Direct / EVUDDY",
          investmentCapacity: "",
          message: "",
          consentAccepted: false,
        });
      } else {
        setFormError(data.errors?.join(" ") || data.message || "Submission failed.");
      }
    } catch (error) {
      console.log(error);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="partner-form" className="scroll-mt-36 bg-[#F7F4EE] py-16 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Fleet & channel partners
        </p>
        <h2 className="font-display mt-4 text-center text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          Partner with EVUDDY
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-8 text-[#5C635E]">
          Dealers, distributors and fleet investors — aligned to our official brief.{" "}
          <a
            href={FLEET_INVESTMENT.pdfHref}
            download={FLEET_INVESTMENT.pdfFileName}
            className="font-medium text-[#1F6B4A]"
          >
            Download fleet investment PDF
          </a>
          , then submit this short form. We do not collect investment money on the website.
        </p>

        <div className="mt-10 rounded-[32px] border border-[#E6EBE7] bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)] sm:p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <p className="text-sm text-[#5C635E] md:col-span-2">
              Tap the mic on any field to speak. Required fields match the PDF tiers — no duplicate paperwork here.
            </p>
            <SpeakAllButton
              onParsed={(parts) => {
                if (parts.name) set("fullName", parts.name);
                if (parts.phone) set("phone", parts.phone);
                if (parts.email) set("email", parts.email);
              }}
            />
            <div className="md:col-span-2">
              <ComingThroughChips
                value={formData.comingThrough}
                onChange={(value) => set("comingThrough", value)}
              />
            </div>
            <VoiceField
              label="Full name *"
              required
              value={formData.fullName}
              onChange={(value) => set("fullName", value)}
              placeholder="As on Aadhaar"
            />
            <VoiceField
              label="Mobile *"
              required
              type="tel"
              inputMode="numeric"
              numeric
              leading={
                <>
                  <span>🇮🇳</span> +91
                </>
              }
              value={formData.phone}
              onChange={(value) => set("phone", value)}
              placeholder="10-digit mobile"
            />
            <VoiceField
              label="Email *"
              required
              type="email"
              className="md:col-span-2"
              value={formData.email}
              onChange={(value) => set("email", value)}
              placeholder="name@email.com"
            />
            <VoiceField
              label="State *"
              required
              value={formData.state}
              onChange={(value) => set("state", value)}
              placeholder="State"
            />
            <VoiceField
              label="City *"
              required
              value={formData.city}
              onChange={(value) => set("city", value)}
              placeholder="Primary city / hub interest"
            />
            <VoiceSelect
              label="Partnership type *"
              required
              className="md:col-span-2"
              value={formData.partnerType}
              onChange={(e) => set("partnerType", e.target.value)}
            >
              {PARTNER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </VoiceSelect>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                Investment capacity (from PDF) *
              </span>
              <select
                required
                value={formData.investmentCapacity}
                onChange={(e) => set("investmentCapacity", e.target.value)}
                className={selectClass}
              >
                <option value="">Select tier</option>
                {INVESTMENT_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>
            <VoiceArea
              label="Brief message"
              className="md:col-span-2"
              rows={4}
              value={formData.message}
              onChange={(value) => set("message", value)}
              placeholder="Showroom, fleet count, or territory — optional detail"
            />
            <label className="flex items-start gap-3 text-sm leading-6 text-[#5C635E] md:col-span-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={formData.consentAccepted}
                onChange={(e) => set("consentAccepted", e.target.checked)}
                required
              />
              I agree to be contacted by EVUDDY regarding partnership opportunities.
            </label>
            {formError ? (
              <p className="text-sm font-medium text-red-700 md:col-span-2">{formError}</p>
            ) : null}
            {formStatus ? (
              <p className="text-sm font-medium text-[#1F6B4A] md:col-span-2">{formStatus}</p>
            ) : null}
            <button type="submit" disabled={loading} className={`${PREMIUM_BTN} md:col-span-2`}>
              {loading ? "Submitting..." : "Submit partnership application →"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
