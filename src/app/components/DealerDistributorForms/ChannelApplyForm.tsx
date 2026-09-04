"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";

import { BRAND } from "@/lib/brandMedia";
import {
  DEALER_INVESTMENT,
  DEALER_TYPE,
  DISTRIBUTOR_INVESTMENT,
  DISTRIBUTOR_TYPE,
  dealerProgram,
} from "@/lib/dealerProgram";

const fieldClass =
  "h-14 w-full border border-[#E4DDD2] bg-[#FBF9F5] px-4 text-[15px] text-[#1C1917] outline-none transition placeholder:text-[#8A847A] focus:border-[#1F6B4A] focus:bg-white";

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

  const set =
    (name: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = event.target;
      setForm((current) => ({
        ...current,
        [name]:
          target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : target.value,
      }));
    };

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
    <section className="relative overflow-hidden bg-[#F7F4EE] pb-24 pt-32 sm:pt-40">
      <img
        src={isDealer ? BRAND.city : BRAND.highway}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F7F4EE] via-[#F7F4EE]/92 to-[#F7F4EE]" />

      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
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
          <div className="relative mt-10 hidden overflow-hidden lg:block">
            <img
              src={isDealer ? BRAND.parked : BRAND.highway}
              alt={
                isDealer
                  ? "EVUDDY yellow scooter at a dealer pickup point"
                  : "EVUDDY yellow scooter on the road — distributor fleet in motion"
              }
              className="aspect-[16/10] w-full bg-[#EDE8DE] object-contain object-center p-4"
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

        <div className="border border-[#E4DDD2] bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)] sm:p-10">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <input
              required
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="Full name *"
              className={fieldClass}
            />
            <input
              required
              value={form.phone}
              onChange={set("phone")}
              placeholder="Mobile (10 digits) *"
              inputMode="numeric"
              className={fieldClass}
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="Email *"
              className={`${fieldClass} sm:col-span-2`}
            />
            <input
              required
              value={form.organizationName}
              onChange={set("organizationName")}
              placeholder={isDealer ? "Showroom / firm name *" : "Distribution firm name *"}
              className={`${fieldClass} sm:col-span-2`}
            />
            <input value={form.gstin} onChange={set("gstin")} placeholder="GSTIN" className={fieldClass} />
            <input
              required
              value={form.state}
              onChange={set("state")}
              placeholder="State *"
              className={fieldClass}
            />
            <input
              required
              value={form.city}
              onChange={set("city")}
              placeholder={isDealer ? "Retail city *" : "Base city *"}
              className={fieldClass}
            />
            <input
              required
              value={form.territory}
              onChange={set("territory")}
              placeholder={isDealer ? "Catchment / locality *" : "Territory (districts / states) *"}
              className={fieldClass}
            />
            <input
              value={form.siteAddress}
              onChange={set("siteAddress")}
              placeholder={isDealer ? "Showroom address" : "Warehouse address"}
              className={`${fieldClass} sm:col-span-2`}
            />
            <select
              required
              value={form.propertyAvailable}
              onChange={set("propertyAvailable")}
              className={fieldClass}
            >
              <option value="Yes">Site available — Yes</option>
              <option value="No">Site available — No (will arrange)</option>
            </select>
            <select required value={form.availableSpace} onChange={set("availableSpace")} className={fieldClass}>
              <option value="Below 500 Sq Ft">Below 500 sq ft</option>
              <option value="500 - 1000 Sq Ft">500 – 1000 sq ft</option>
              <option value="1000 - 5000 Sq Ft">1000 – 5000 sq ft</option>
              <option value="5000+ Sq Ft">5000+ sq ft</option>
            </select>
            <select
              required
              value={form.businessExperience}
              onChange={set("businessExperience")}
              className={fieldClass}
            >
              <option value="">Retail / auto experience *</option>
              <option value="Fresher">Fresher</option>
              <option value="1 - 3 Years">1 – 3 years</option>
              <option value="3 - 5 Years">3 – 5 years</option>
              <option value="5+ Years">5+ years</option>
            </select>
            <select
              required
              value={form.plannedFleetSize}
              onChange={set("plannedFleetSize")}
              className={fieldClass}
            >
              <option value="1 - 10 Vehicles">
                {isDealer ? "1 – 10 scooters on floor" : "Supply 1 – 10 scooters"}
              </option>
              <option value="10 - 50 Vehicles">
                {isDealer ? "10 – 50 scooters" : "Supply 10 – 50 scooters"}
              </option>
              <option value="50 - 100 Vehicles">
                {isDealer ? "50 – 100 scooters" : "Supply 50 – 100 scooters"}
              </option>
              <option value="100+ Vehicles">{isDealer ? "100+ scooters" : "Supply 100+ scooters"}</option>
            </select>
            <textarea
              value={form.message}
              onChange={set("message")}
              rows={4}
              placeholder={
                isDealer
                  ? "Retail plan — nearby demand, staff, why EVUDDY in this city"
                  : "Distribution plan — dealers you already know, logistics, why this territory"
              }
              className={`${fieldClass} h-auto py-3 sm:col-span-2`}
            />
            <label className="flex items-start gap-3 text-sm leading-6 text-[#5C635E] sm:col-span-2">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={set("consentAccepted")}
                className="mt-1"
                required
              />
              I confirm this is an EVUDDY {isDealer ? "dealer" : "distributor"} application with a
              minimum investment of {isDealer ? dealerProgram.dealerMin : dealerProgram.distributorMin}.
            </label>
            {error ? <p className="text-sm font-medium text-red-700 sm:col-span-2">{error}</p> : null}
            {done ? <p className="text-sm font-medium text-[#1F6B4A] sm:col-span-2">{done}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="h-14 bg-[#1F6B4A] px-8 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c] disabled:opacity-60 sm:col-span-2"
            >
              {loading
                ? "Sending…"
                : isDealer
                  ? "Submit dealer application"
                  : "Submit distributor application"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
