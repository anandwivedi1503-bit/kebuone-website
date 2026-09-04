"use client";

import { useState } from "react";

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
  investmentCapacity: "",
  propertyAvailable: "",
  availableSpace: "",
  businessExperience: "",
  plannedFleetSize: "",
  message: "",
consentAccepted: false,
});

const [loading, setLoading] = useState(false);

const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement |
    HTMLSelectElement |
    HTMLTextAreaElement
  >
) => {
  const target = e.target;

  setFormData({
    ...formData,
    [target.name]:
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value,
  });
};

const handleSubmit = async (
  e: React.FormEvent
) => {

  e.preventDefault();

  try {

    setLoading(true);

    const res = await fetch("/api/partners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {

      alert(
        "Partner Application Submitted Successfully"
      );

      setFormData({
        fullName: "",
        phone: "",
        email: "",
        organizationName: "",
        state: "",
        city: "",
        territory: "",
        partnerType: "",
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
    <section
      id="partner-form"
      className="scroll-mt-36 py-16 md:py-32 bg-[#F7F4EE]"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* ================= Premium EVUDDY Header ================= */}

<div className="text-center mb-10 sm:mb-20">

  {/* Premium Badge */}

  <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-[#18B368]/20 bg-white px-4 py-3 shadow-[0_15px_40px_rgba(15,23,42,0.08)] sm:px-7">

    <div className="w-3 h-3 rounded-full bg-[#18B368] animate-pulse" />

    <span className="text-[12px] font-semibold tracking-wide text-[#18B368] uppercase sm:text-[15px]">
      EVUDDY PARTNERSHIP PROGRAM
    </span>

  </div>

  {/* Heading */}

  <h2 className="mt-8 text-3xl md:text-6xl xl:text-7xl font-black leading-[1.05] tracking-[-0.04em]">

    <span className="text-[#0F172A]">
      Build the Future
    </span>

    <br />

    <span className="bg-gradient-to-r from-[#1F6B4A] via-[#18B368] to-[#6EE7A8] bg-clip-text text-transparent">
      With EVUDDY
    </span>

  </h2>

  {/* Description */}

  <p className="mt-8 max-w-3xl mx-auto text-[16px] leading-8 text-slate-600 sm:text-[19px] sm:leading-9">

    Join India's next-generation electric mobility ecosystem.

    Launch an EVUDDY franchise and build a sustainable business across

    EV rentals, smart charging, fleet operations, mobility hubs,

    delivery services and campus transportation.

  </p>

  <p className="mt-5 text-sm font-medium text-slate-500">
    Looking at Fleet Partner Investment?{" "}
    <a href="#fleet-investment" className="font-bold text-[#18B368] underline-offset-4 hover:underline">
      Review the plans and poster first
    </a>
    .
  </p>

  {/* Trust Pills */}

  <div className="mt-10 flex flex-wrap justify-center gap-4">

    <div className="rounded-full border border-[#18B368]/15 bg-white px-6 py-3 text-sm font-semibold text-[#18B368] shadow-sm">
      ✓ Fast Approval
    </div>

    <div className="rounded-full border border-[#18B368]/15 bg-white px-6 py-3 text-sm font-semibold text-[#18B368] shadow-sm">
      ✓ Dedicated Support
    </div>

    <div className="rounded-full border border-[#18B368]/15 bg-white px-6 py-3 text-sm font-semibold text-[#18B368] shadow-sm">
      ✓ PAN India Expansion
    </div>

    <div className="rounded-full border border-[#18B368]/15 bg-white px-6 py-3 text-sm font-semibold text-[#18B368] shadow-sm">
      ✓ Trusted EV Platform
    </div>

  </div>

</div>

        {/* Form */}
<div
className="
relative
overflow-hidden
bg-white/95
backdrop-blur-xl
rounded-[36px]
md:rounded-[40px]
p-6
md:p-12
border
border-white
shadow-[0_35px_90px_rgba(15,23,42,0.10)]
transition-all
duration-500
"
>

  {/* Premium Top Border */}

<div
className="
absolute
top-0
left-0
w-full
h-1
bg-gradient-to-r
from-[#18B368]
via-[#22C55E]
to-[#1F6B4A]
"
/>

          <form
  onSubmit={handleSubmit}
  className="
grid
grid-cols-1
md:grid-cols-2
gap-6
"
>

            {/* Name */}
            <input
  type="text"
  name="fullName"
  value={formData.fullName}
  onChange={handleChange}
  placeholder="Full Name *"
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
/>

            {/* Mobile */}
            <input
  type="tel"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  placeholder="Mobile Number *"
              className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
            />

            {/* Email */}
            <input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  placeholder="Email Address *"
              className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
            />

            {/* Organization */}
            <input
  type="text"
  name="organizationName"
  value={formData.organizationName}
  onChange={handleChange}
  placeholder="Organization / Business Name *"
              className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
            />

            {/* State */}
            <input
  type="text"
  name="state"
  value={formData.state}
  onChange={handleChange}
  placeholder="State *"
              className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
            />

            {/* City */}
            <input
  type="text"
  name="city"
  value={formData.city}
  onChange={handleChange}
  placeholder="City *"
              className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
            />

            <input
  type="text"
  name="territory"
  value={formData.territory}
  onChange={handleChange}
  placeholder="Preferred Franchise Territory *"
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
/>

            {/* Partner Type */}
            <select
  name="partnerType"
  value={formData.partnerType}
  onChange={handleChange}
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
>
              <option value="">Select Partnership Type *</option>
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
            </select>

            {/* Investment */}
            <select
  name="investmentCapacity"
  value={formData.investmentCapacity}
  onChange={handleChange}
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
>
              <option value="">Investment Capacity *</option>
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

            {/* Property */}
            <select
  name="propertyAvailable"
  value={formData.propertyAvailable}
  onChange={handleChange}
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
>
              <option>Property Available? *</option>
              <option>Yes</option>
              <option>No</option>
            </select>

            {/* Space */}
            <select
  name="availableSpace"
  value={formData.availableSpace}
  onChange={handleChange}
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
>
              <option>Available Space *</option>
              <option>Below 500 Sq Ft</option>
              <option>500 - 1000 Sq Ft</option>
              <option>1000 - 5000 Sq Ft</option>
              <option>5000+ Sq Ft</option>
            </select>

            {/* Experience */}
            <select
  name="businessExperience"
  value={formData.businessExperience}
  onChange={handleChange}
 className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
>
              <option>Business Experience *</option>
              <option>Fresher</option>
              <option>1 - 3 Years</option>
              <option>3 - 5 Years</option>
              <option>5+ Years</option>
            </select>

            <select
  name="plannedFleetSize"
  value={formData.plannedFleetSize}
  onChange={handleChange}
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
"
>
  <option>Planned Fleet Size *</option>
  <option>1 - 10 Vehicles</option>
  <option>10 - 50 Vehicles</option>
  <option>50 - 100 Vehicles</option>
  <option>100+ Vehicles</option>
</select>

            {/* Message */}
            <textarea
  name="message"
  value={formData.message}
  onChange={handleChange}
  rows={6}
  placeholder="Tell us about your business, organization, college, property, or partnership interest..."
              className="
md:col-span-2
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
p-5
text-[15px]
leading-7
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
hover:border-[#22C55E]/40
resize-none
"
            />

            <label
className="
md:col-span-2
flex
items-center
gap-4
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
py-4
text-[15px]
text-slate-600
"
>
  <input
type="checkbox"
className="
h-5
w-5
rounded
border-slate-300
text-[#16A34A]
focus:ring-[#22C55E]
"
    name="consentAccepted"
    checked={formData.consentAccepted}
    onChange={handleChange}
  />
  I agree to be contacted by EVUDDY regarding partnership and franchise opportunities.
</label>

<div className="md:col-span-2 flex flex-wrap gap-3 mb-2">

<div className="px-5 py-2 rounded-full bg-[#F4FFF8] border border-[#18B368]/20 text-[#16A34A] text-sm font-semibold">
✓ Fast Verification
</div>

<div className="px-5 py-2 rounded-full bg-[#F4FFF8] border border-[#18B368]/20 text-[#16A34A] text-sm font-semibold">
✓ Dedicated Support
</div>

<div className="px-5 py-2 rounded-full bg-[#F4FFF8] border border-[#18B368]/20 text-[#16A34A] text-sm font-semibold">
✓ PAN India Network
</div>

</div>

            {/* Submit */}
            <button
              type="submit"
              className="
md:col-span-2
h-16
rounded-2xl
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
text-white
font-bold
text-lg
shadow-[0_18px_45px_rgba(24,179,104,.35)]
transition-all
duration-300
hover:scale-[1.02]
hover:shadow-[0_24px_60px_rgba(24,179,104,.45)]
active:scale-[0.98]
"
            >
              {
  loading
    ? "Submitting..."
    : "Apply for EVUDDY Partnership →"
}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}