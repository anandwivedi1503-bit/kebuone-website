"use client";

import { useState } from "react";
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

export default function PartnerForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    organizationName: "",
    state: "",
    city: "",
    territory: "",
    partnerType: "",
    comingThrough: "Direct / EVUDDY",
    investmentCapacity: "",
    propertyAvailable: "",
    availableSpace: "",
    businessExperience: "",
    plannedFleetSize: "",
    message: "",
    consentAccepted: false,
  });
  const [loading, setLoading] = useState(false);

  const set = (name: string, value: string | boolean) =>
    setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Partner Application Submitted Successfully");
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          organizationName: "",
          state: "",
          city: "",
          territory: "",
          partnerType: "",
          comingThrough: "Direct / EVUDDY",
          investmentCapacity: "",
          propertyAvailable: "",
          availableSpace: "",
          businessExperience: "",
          plannedFleetSize: "",
          message: "",
          consentAccepted: false,
        });
      } else {
        alert(data.errors?.join("\n") || data.message || "Submission Failed");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="partner-form" className="scroll-mt-36 bg-[#F7F4EE] py-16 md:py-28">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Partnership programme
        </p>
        <h2 className="font-display mt-4 text-center text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          Apply with EVUDDY
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-8 text-[#5C635E]">
          Dealers, distributors and fleet partners use this form. Looking at fleet investment first?{" "}
          <a href="#fleet-investment" className="font-medium text-[#1F6B4A]">
            Download the PDF
          </a>
          .
        </p>

        <div className="mt-10 rounded-[32px] border border-[#E6EBE7] bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)] sm:p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <p className="text-sm text-[#5C635E] md:col-span-2">
              Tap the mic on any field to speak. We&apos;ll fill that box from your voice.
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
              placeholder="As on Aadhaar · or tap the mic"
            />
            <VoiceField
              label="Mobile number *"
              required
              type="tel"
              inputMode="numeric"
              numeric
              prefix={
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
              placeholder='name@email.com · say "at" and "dot"'
            />
            <VoiceField
              label="Organization / firm *"
              required
              className="md:col-span-2"
              value={formData.organizationName}
              onChange={(value) => set("organizationName", value)}
              placeholder="Showroom, warehouse or company name"
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
              placeholder="City"
            />
            <VoiceField
              label="Territory *"
              required
              className="md:col-span-2"
              value={formData.territory}
              onChange={(value) => set("territory", value)}
              placeholder="Catchment, districts or states"
            />
            <VoiceSelect
              label="Partnership type *"
              required
              value={formData.partnerType}
              onChange={(e) => set("partnerType", e.target.value)}
            >
              <option value="">Select partnership type</option>
              <option>EVUDDY Dealer</option>
              <option>EVUDDY Distributor</option>
              <option>Fleet Partner Investment</option>
              <option>College Mobility Partner</option>
              <option>Bike Rental Franchise Partner</option>
              <option>EV Charging Partner</option>
              <option>Fleet Partner</option>
              <option>Hub Operations Partner</option>
              <option>Delivery Operations Partner</option>
              <option>Smart Parking Partner</option>
            </VoiceSelect>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                Investment capacity *
              </span>
              <select
                required
                value={formData.investmentCapacity}
                onChange={(e) => set("investmentCapacity", e.target.value)}
                className={selectClass}
              >
                <option value="">Investment capacity</option>
                <option>₹5 Lakhs · Dealer (retail)</option>
                <option>₹10 Lakhs · Distributor</option>
                <option>₹1 Lakh · 3 scooters</option>
                <option>₹5 Lakh · 15 scooters</option>
                <option>₹10 Lakh · 30 scooters</option>
                <option>Below ₹5 Lakhs</option>
                <option>₹5 – ₹10 Lakhs</option>
                <option>₹10 – ₹25 Lakhs</option>
                <option>₹25 – ₹50 Lakhs</option>
                <option>₹50 Lakhs+</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                Property available *
              </span>
              <select
                required
                value={formData.propertyAvailable}
                onChange={(e) => set("propertyAvailable", e.target.value)}
                className={selectClass}
              >
                <option value="">Property available?</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                Available space *
              </span>
              <select
                required
                value={formData.availableSpace}
                onChange={(e) => set("availableSpace", e.target.value)}
                className={selectClass}
              >
                <option value="">Available space</option>
                <option>Below 500 Sq Ft</option>
                <option>500 - 1000 Sq Ft</option>
                <option>1000 - 5000 Sq Ft</option>
                <option>5000+ Sq Ft</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                Business experience *
              </span>
              <select
                required
                value={formData.businessExperience}
                onChange={(e) => set("businessExperience", e.target.value)}
                className={selectClass}
              >
                <option value="">Business experience</option>
                <option>Fresher</option>
                <option>1 - 3 Years</option>
                <option>3 - 5 Years</option>
                <option>5+ Years</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                Planned fleet size *
              </span>
              <select
                required
                value={formData.plannedFleetSize}
                onChange={(e) => set("plannedFleetSize", e.target.value)}
                className={selectClass}
              >
                <option value="">Planned fleet size</option>
                <option>1 - 10 Vehicles</option>
                <option>10 - 50 Vehicles</option>
                <option>50 - 100 Vehicles</option>
                <option>100+ Vehicles</option>
              </select>
            </label>
            <VoiceArea
              label="Message"
              className="md:col-span-2"
              rows={5}
              value={formData.message}
              onChange={(value) => set("message", value)}
              placeholder="Tell us about your business, property or partnership interest"
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
            <button type="submit" disabled={loading} className={`${PREMIUM_BTN} md:col-span-2`}>
              {loading ? "Submitting..." : "Apply for EVUDDY partnership →"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
