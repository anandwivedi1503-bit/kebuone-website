"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import {
  DEALER_INVESTMENT,
  DEALER_TYPE,
  DISTRIBUTOR_INVESTMENT,
  DISTRIBUTOR_TYPE,
  dealerProgram,
} from "@/lib/dealerProgram";

const fieldClass =
  "h-14 w-full rounded-none border border-[#E4DDD2] bg-white px-4 text-[15px] text-[#1C1917] outline-none transition placeholder:text-[#8A847A] focus:border-[#1F6B4A]";

type Channel = "dealer" | "distributor";

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

function ChannelForm({ channel }: { channel: Channel }) {
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
    <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
      <input
        required
        name="fullName"
        value={form.fullName}
        onChange={set("fullName")}
        placeholder="Full name *"
        className={fieldClass}
      />
      <input
        required
        name="phone"
        value={form.phone}
        onChange={set("phone")}
        placeholder="Mobile (10 digits) *"
        inputMode="numeric"
        className={fieldClass}
      />
      <input
        required
        type="email"
        name="email"
        value={form.email}
        onChange={set("email")}
        placeholder="Email *"
        className={`${fieldClass} sm:col-span-2`}
      />
      <input
        required
        name="organizationName"
        value={form.organizationName}
        onChange={set("organizationName")}
        placeholder={isDealer ? "Showroom / firm name *" : "Distribution firm name *"}
        className={`${fieldClass} sm:col-span-2`}
      />
      <input
        name="gstin"
        value={form.gstin}
        onChange={set("gstin")}
        placeholder="GSTIN"
        className={fieldClass}
      />
      <input
        required
        name="state"
        value={form.state}
        onChange={set("state")}
        placeholder="State *"
        className={fieldClass}
      />
      <input
        required
        name="city"
        value={form.city}
        onChange={set("city")}
        placeholder={isDealer ? "Retail city *" : "Base city *"}
        className={fieldClass}
      />
      <input
        required
        name="territory"
        value={form.territory}
        onChange={set("territory")}
        placeholder={
          isDealer ? "Catchment / locality *" : "Territory (districts / states) *"
        }
        className={fieldClass}
      />
      <input
        name="siteAddress"
        value={form.siteAddress}
        onChange={set("siteAddress")}
        placeholder={isDealer ? "Showroom address" : "Warehouse address"}
        className={`${fieldClass} sm:col-span-2`}
      />
      <select
        required
        name="propertyAvailable"
        value={form.propertyAvailable}
        onChange={set("propertyAvailable")}
        className={fieldClass}
      >
        <option value="Yes">Site available — Yes</option>
        <option value="No">Site available — No (will arrange)</option>
      </select>
      <select
        required
        name="availableSpace"
        value={form.availableSpace}
        onChange={set("availableSpace")}
        className={fieldClass}
      >
        <option value="Below 500 Sq Ft">Below 500 sq ft</option>
        <option value="500 - 1000 Sq Ft">500 – 1000 sq ft</option>
        <option value="1000 - 5000 Sq Ft">1000 – 5000 sq ft</option>
        <option value="5000+ Sq Ft">5000+ sq ft</option>
      </select>
      <select
        required
        name="businessExperience"
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
        name="plannedFleetSize"
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
        name="message"
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
        minimum investment of {isDealer ? dealerProgram.dealerMin : dealerProgram.distributorMin},
        and EVUDDY may contact me on this number and email.
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
  );
}

export default function DealerDistributorForms() {
  return (
    <section className="bg-[#FBF9F5] py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-px bg-[#E4DDD2] px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
        <div id="dealer-form" className="scroll-mt-36 bg-[#FBF9F5] py-10 pr-0 sm:scroll-mt-44 lg:pr-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5F6B63]">
            Dealer form
          </p>
          <h2 className="font-display mt-3 text-3xl font-medium text-[#1C1917]">
            Retail EVUDDY in your city
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#5C635E]">
            Minimum {dealerProgram.dealerMin}. You sell and rent yellow EVUDDY scooters to riders.
            KYC, GST invoices and hub OTP stay on the EVUDDY platform.
          </p>
          <ChannelForm channel="dealer" />
        </div>
        <div
          id="distributor-form"
          className="scroll-mt-36 bg-[#FBF9F5] py-10 pl-0 sm:scroll-mt-44 lg:pl-12"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5F6B63]">
            Distributor form
          </p>
          <h2 className="font-display mt-3 text-3xl font-medium text-[#1C1917]">
            Supply dealers in your territory
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#5C635E]">
            Minimum {dealerProgram.distributorMin}. You distribute to authorised EVUDDY dealers —
            not a consumer rental counter.
          </p>
          <ChannelForm channel="distributor" />
        </div>
      </div>
    </section>
  );
}
