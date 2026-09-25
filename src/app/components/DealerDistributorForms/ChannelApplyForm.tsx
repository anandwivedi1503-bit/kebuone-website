"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";

import { BRAND } from "@/lib/brandMedia";
import {
  DEALER_INVESTMENT,
  DEALER_TYPE,
  DISTRIBUTOR_INVESTMENT,
  DISTRIBUTOR_TYPE,
  dealerProgram,
} from "@/lib/dealerProgram";
import { DIRECT_THROUGH } from "@/lib/partnerSegments";
import {
  PREMIUM_BTN,
  SpeakAllButton,
  VoiceArea,
  VoiceField,
  VoiceSelect,
} from "../FormVoice/FormVoiceDock";
import HomeImg from "../HomeMedia/HomeImg";

const empty = {
  fullName: "",
  phone: "",
  email: "",
  organizationName: "",
  gstin: "",
  state: "",
  city: "",
  territory: "",
  siteAddress: "",
  propertyAvailable: "Yes",
  availableSpace: "",
  businessExperience: "",
  plannedFleetSize: "",
  message: "",
  consentAccepted: false,
};

export default function ChannelApplyForm({ channel }: { channel: "dealer" | "distributor" }) {
  const isDealer = channel === "dealer";
  const [form, setForm] = useState({
    ...empty,
    availableSpace: isDealer ? "500 - 1000 Sq Ft" : "1000 - 5000 Sq Ft",
    plannedFleetSize: isDealer ? "1 - 10 Vehicles" : "50 - 100 Vehicles",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const set = (name: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [name]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setDone("");
    setLoading(true);
    try {
      const notes = [
        isDealer ? "Channel: EVUDDY Dealer (retail)" : "Channel: EVUDDY Distributor (wholesale)",
        form.gstin ? `GSTIN: ${form.gstin}` : "",
        form.siteAddress
          ? isDealer
            ? `Showroom: ${form.siteAddress}`
            : `Warehouse: ${form.siteAddress}`
          : "",
        form.message ? `Notes: ${form.message}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone.replace(/\D/g, "").slice(-10),
          email: form.email,
          organizationName: form.organizationName,
          state: form.state,
          city: form.city,
          territory: form.territory,
          partnerType: isDealer ? DEALER_TYPE : DISTRIBUTOR_TYPE,
          investmentCapacity: isDealer ? DEALER_INVESTMENT : DISTRIBUTOR_INVESTMENT,
          propertyAvailable: form.propertyAvailable,
          availableSpace: form.availableSpace,
          businessExperience: form.businessExperience,
          plannedFleetSize: form.plannedFleetSize,
          comingThrough: DIRECT_THROUGH,
          message: notes,
          consentAccepted: form.consentAccepted,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(
          Array.isArray(data.errors) ? data.errors.join(" ") : data.message || "Submission failed."
        );
        return;
      }
      setDone(
        isDealer
          ? "Dealer application received. EVUDDY will contact you about the ₹5 lakh retail programme."
          : "Distributor application received. EVUDDY will contact you about the ₹10 lakh territory programme."
      );
      setForm({
        ...empty,
        availableSpace: isDealer ? "500 - 1000 Sq Ft" : "1000 - 5000 Sq Ft",
        plannedFleetSize: isDealer ? "1 - 10 Vehicles" : "50 - 100 Vehicles",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-under-nav bg-[#F7F4EE] pb-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
        <div>
          <Link
            href="/partners#dealer-network"
            className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-[#1F6B4A]"
          >
            <ArrowLeft size={16} />
            All partner paths
          </Link>
          <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            {isDealer ? "Dealer application" : "Distributor application"}
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            {isDealer ? "Retail EVUDDY in your city" : "Supply dealers in your territory"}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-8 text-[#5C635E]">
            {isDealer
              ? `This form is only for EVUDDY dealers. Minimum ${dealerProgram.dealerMin}. You sell and rent yellow scooters to riders — KYC, GST and hub OTP stay on our platform.`
              : `This form is only for EVUDDY distributors. Minimum ${dealerProgram.distributorMin}. You supply authorised dealers — not a consumer rental counter.`}
          </p>
          <p className="mt-6 font-display text-3xl font-medium text-[#1C1917]">
            {isDealer ? dealerProgram.dealerMin : dealerProgram.distributorMin}
            <span className="ml-2 text-base font-sans font-normal text-[#8A847A]">minimum</span>
          </p>
          <div className="relative mt-10 hidden overflow-hidden rounded-[28px] lg:block">
            <HomeImg
              src={isDealer ? BRAND.dealer : BRAND.distributor}
              alt={
                isDealer
                  ? "EVUDDY dealer showroom with yellow scooters"
                  : "EVUDDY distributor warehouse with scooters ready to ship"
              }
              className="aspect-[16/10] w-full object-cover object-center"
            />
          </div>
          <p className="mt-6 text-sm text-[#5C635E]">
            Need the other path?{" "}
            <Link
              href={isDealer ? "/partners/distributor" : "/partners/dealer"}
              className="font-medium text-[#1F6B4A] underline-offset-4 hover:underline"
            >
              {isDealer ? "Open the distributor form" : "Open the dealer form"}
            </Link>
          </p>
        </div>

        <div className="rounded-[32px] border border-[#E6EBE7] bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)] sm:p-10">
          <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
            <p className="text-sm text-[#5C635E] sm:col-span-2">
              Tap the mic on every field. We fill that box from your voice.
            </p>
            <SpeakAllButton
              onParsed={(parts) => {
                if (parts.name) set("fullName", parts.name);
                if (parts.phone) set("phone", parts.phone);
                if (parts.email) set("email", parts.email);
              }}
            />
            <VoiceField
              label="Full name *"
              required
              value={form.fullName}
              onChange={(value) => set("fullName", value)}
              placeholder="As on Aadhaar · or tap the mic"
            />
            <VoiceField
              label="Mobile number *"
              required
              type="tel"
              inputMode="numeric"
              numeric
              leading={
                <>
                  <span>🇮🇳</span> +91
                </>
              }
              value={form.phone}
              onChange={(value) => set("phone", value)}
              placeholder="10-digit mobile"
            />
            <VoiceField
              label="Email *"
              required
              type="email"
              className="sm:col-span-2"
              value={form.email}
              onChange={(value) => set("email", value)}
              placeholder='name@email.com · say "at" and "dot"'
            />
            <VoiceField
              label={isDealer ? "Showroom / firm *" : "Distribution firm *"}
              required
              className="sm:col-span-2"
              value={form.organizationName}
              onChange={(value) => set("organizationName", value)}
              placeholder={isDealer ? "Showroom / firm name" : "Distribution firm name"}
            />
            <VoiceField
              label="GSTIN"
              value={form.gstin}
              onChange={(value) => set("gstin", value)}
              placeholder="GSTIN"
            />
            <VoiceField
              label="State *"
              required
              value={form.state}
              onChange={(value) => set("state", value)}
              placeholder="State"
            />
            <VoiceField
              label={isDealer ? "Retail city *" : "Base city *"}
              required
              value={form.city}
              onChange={(value) => set("city", value)}
              placeholder="City"
            />
            <VoiceField
              label={isDealer ? "Catchment *" : "Territory *"}
              required
              value={form.territory}
              onChange={(value) => set("territory", value)}
              placeholder={isDealer ? "Catchment / locality" : "Districts / states"}
            />
            <VoiceField
              label={isDealer ? "Showroom address" : "Warehouse address"}
              className="sm:col-span-2"
              value={form.siteAddress}
              onChange={(value) => set("siteAddress", value)}
              placeholder="Street, area, PIN"
            />
            <VoiceSelect
              label="Site available *"
              required
              value={form.propertyAvailable}
              onChange={(e) => set("propertyAvailable", e.target.value)}
            >
              <option value="Yes">Site available — Yes</option>
              <option value="No">Site available — No (will arrange)</option>
            </VoiceSelect>
            <VoiceSelect
              label="Space *"
              required
              value={form.availableSpace}
              onChange={(e) => set("availableSpace", e.target.value)}
            >
              <option value="Below 500 Sq Ft">Below 500 sq ft</option>
              <option value="500 - 1000 Sq Ft">500 – 1000 sq ft</option>
              <option value="1000 - 5000 Sq Ft">1000 – 5000 sq ft</option>
              <option value="5000+ Sq Ft">5000+ sq ft</option>
            </VoiceSelect>
            <VoiceSelect
              label="Experience *"
              required
              value={form.businessExperience}
              onChange={(e) => set("businessExperience", e.target.value)}
            >
              <option value="">Retail / auto experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1 - 3 Years">1 – 3 years</option>
              <option value="3 - 5 Years">3 – 5 years</option>
              <option value="5+ Years">5+ years</option>
            </VoiceSelect>
            <VoiceSelect
              label="Fleet *"
              required
              value={form.plannedFleetSize}
              onChange={(e) => set("plannedFleetSize", e.target.value)}
            >
              <option value="1 - 10 Vehicles">
                {isDealer ? "1 – 10 scooters on floor" : "Supply 1 – 10 scooters"}
              </option>
              <option value="10 - 50 Vehicles">{isDealer ? "10 – 50 scooters" : "Supply 10 – 50 scooters"}</option>
              <option value="50 - 100 Vehicles">
                {isDealer ? "50 – 100 scooters" : "Supply 50 – 100 scooters"}
              </option>
              <option value="100+ Vehicles">{isDealer ? "100+ scooters" : "Supply 100+ scooters"}</option>
            </VoiceSelect>
            <VoiceArea
              label="Notes"
              className="sm:col-span-2"
              rows={4}
              value={form.message}
              onChange={(value) => set("message", value)}
              placeholder={
                isDealer
                  ? "Retail plan — nearby demand, staff, why EVUDDY in this city"
                  : "Distribution plan — dealers you already know, logistics, why this territory"
              }
            />
            <label className="flex items-start gap-3 text-sm leading-6 text-[#5C635E] sm:col-span-2">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(e) => set("consentAccepted", e.target.checked)}
                className="mt-1"
                required
              />
              I confirm this is an EVUDDY {isDealer ? "dealer" : "distributor"} application with a
              minimum investment of {isDealer ? dealerProgram.dealerMin : dealerProgram.distributorMin}.
            </label>
            {error ? <p className="text-sm font-medium text-red-700 sm:col-span-2">{error}</p> : null}
            {done ? <p className="text-sm font-medium text-[#1F6B4A] sm:col-span-2">{done}</p> : null}
            <button type="submit" disabled={loading} className={`${PREMIUM_BTN} sm:col-span-2`}>
              {loading
                ? "Sending…"
                : isDealer
                  ? "Submit dealer application →"
                  : "Submit distributor application →"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
