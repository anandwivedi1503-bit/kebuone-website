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
      className="py-16 md:py-32 bg-gradient-to-b from-[#FFF7FA] via-white to-[#FFF7FA]"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="px-5 py-2 rounded-full bg-pink-100 text-pink-600 font-semibold">
            KEBU ONE PARTNERSHIP PROGRAM
          </span>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0A1134] mt-6 mb-6">
            Become A Kebu One Partner
          </h2>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Join Kebu One’s mobility ecosystem and build the future of
            bike rentals, EV charging, fleet operations, smart hubs,
            delivery services and campus mobility.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-12 shadow-2xl border border-pink-100">

          <form
  onSubmit={handleSubmit}
  className=" grid grid-cols-1 md:grid-cols-2 gap-5"
>

            {/* Name */}
            <input
  type="text"
  name="fullName"
  value={formData.fullName}
  onChange={handleChange}
  placeholder="Full Name *"
  className="
    border
    border-gray-200
    rounded-xl
    h-14
    px-4
    bg-white
    text-[#0A1134]
    placeholder:text-gray-500
    placeholder:opacity-100
    outline-none
    focus:border-[#FF165E]
  "
/>

            {/* Mobile */}
            <input
  type="tel"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  placeholder="Mobile Number *"
              className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 outline-none focus:border-[#FF165E]"
            />

            {/* Email */}
            <input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  placeholder="Email Address *"
              className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 outline-none focus:border-[#FF165E]"
            />

            {/* Organization */}
            <input
  type="text"
  name="organizationName"
  value={formData.organizationName}
  onChange={handleChange}
  placeholder="Organization / Business Name *"
              className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 outline-none focus:border-[#FF165E]"
            />

            {/* State */}
            <input
  type="text"
  name="state"
  value={formData.state}
  onChange={handleChange}
  placeholder="State *"
              className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 outline-none focus:border-[#FF165E]"
            />

            {/* City */}
            <input
  type="text"
  name="city"
  value={formData.city}
  onChange={handleChange}
  placeholder="City *"
              className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 outline-none focus:border-[#FF165E]"
            />

            <input
  type="text"
  name="territory"
  value={formData.territory}
  onChange={handleChange}
  placeholder="Preferred Franchise Territory *"
  className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 outline-none focus:border-[#FF165E]"
/>

            {/* Partner Type */}
            <select
  name="partnerType"
  value={formData.partnerType}
  onChange={handleChange}
  className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] outline-none focus:border-[#FF165E]"
>
              <option>Select Partnership Type *</option>
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
  className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] outline-none focus:border-[#FF165E]"
>
              <option>Investment Capacity *</option>
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
  className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] outline-none focus:border-[#FF165E]"
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
  className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] outline-none focus:border-[#FF165E]"
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
  className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] outline-none focus:border-[#FF165E]"
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
  className="border border-gray-200 rounded-xl h-14 px-4 bg-white text-[#0A1134] outline-none focus:border-[#FF165E]"
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
              className="md:col-span-2 border border-gray-200 rounded-xl p-4 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 outline-none focus:border-[#FF165E]"
            />

            <label className="md:col-span-2 flex items-center gap-3 text-sm text-gray-600">
  <input
    type="checkbox"
    name="consentAccepted"
    checked={formData.consentAccepted}
    onChange={handleChange}
  />
  I agree to be contacted by Kebu One regarding franchise opportunities.
</label>

            {/* Submit */}
            <button
              type="submit"
              className="md:col-span-2 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E] text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all duration-300"
            >
              {
  loading
    ? "Submitting..."
    : "Submit Partnership Application →"
}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}