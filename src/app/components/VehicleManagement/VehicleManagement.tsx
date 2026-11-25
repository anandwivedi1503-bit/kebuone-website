"use client";

import { useEffect, useState } from "react";

import { startOpsPoll } from "@/lib/opsPoll";
import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import SectionHeader from "../DashboardUI/SectionHeader";
import ActionButton from "../DashboardUI/ActionButton";
import { CATALOG_RATES, COMPANY_SECURITY_DEPOSIT, RTO_PLAN } from "@/lib/rentalPlans";

export default function VehicleManagement() {

        const [saving, setSaving] = useState(false);

const [hubs, setHubs] = useState<
  Array<{ hubCode: string; hubName: string; city?: string }>
>([]);
const [fleetStats, setFleetStats] = useState({
  total: 0,
  available: 0,
  online: 0,
  locked: 0,
  rto: 0,
});

useEffect(() => {
  const loadHubs = async () => {
    try {
      const res = await fetch("/api/hubs", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setHubs(data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadFleetStats = async () => {
    try {
      const res = await fetch("/api/vehicles?limit=1", { cache: "no-store" });
      const data = await res.json();
      const summary = data.summary || {};
      setFleetStats({
        total: Number(summary.total || 0),
        available: Number(summary.available || 0),
        online: Number(summary.online || 0),
        locked: Number(summary.locked || 0),
        rto: Number(summary.rto || 0),
      });
    } catch {
      /* keep last known stats */
    }
  };

  void loadHubs();
  void loadFleetStats();
  return startOpsPoll(loadFleetStats);
}, []);

const [formData, setFormData] = useState({
vehicleId: "",

registrationNumber: "",

registrationType: "RTO",

chassisNumber: "",

vehicleType: "Electric Scooter",

vehicleModel: "",

batteryType: "Chargeable",

dailyRate: CATALOG_RATES.Daily,
hourlyRate: CATALOG_RATES.Hourly,
weeklyRate: CATALOG_RATES.Weekly,
monthlyRate: CATALOG_RATES.Monthly,
rentToOwnDailyRate: RTO_PLAN.dailyRate,
rentToOwnMonths: 18,

securityDeposit: COMPANY_SECURITY_DEPOSIT,

gpsStatus: "OFFLINE",

lockStatus: "Locked",

currentHub: "",

vehicleStatus: "Available",

assignedRider: "",

odometer: 0,

lastServiceDate: "",

insuranceExpiry: "",

fitnessExpiry: "",

pollutionExpiry: "",

remarks: "",

});

const handleSubmit = async (e:any)=>{

e.preventDefault();
if (saving) return;
if (!formData.vehicleId.trim()) {
  alert("Vehicle ID is required.");
  return;
}

if (!formData.registrationNumber.trim()) {
  alert("Registration Number is required.");
  return;
}

if (!formData.vehicleModel.trim()) {
  alert("Vehicle Model is required.");
  return;
}

if (!formData.currentHub.trim()) {
  alert("Current Hub is required.");
  return;
}
   setSaving(true);

try {

const res = await fetch("/api/vehicles", {

method: "POST",

headers: {
"Content-Type": "application/json",
},

body: JSON.stringify({
  ...formData,
  hourlyRate: CATALOG_RATES.Hourly,
  dailyRate: CATALOG_RATES.Daily,
  weeklyRate: CATALOG_RATES.Weekly,
  monthlyRate: CATALOG_RATES.Monthly,
  rentToOwnDailyRate: RTO_PLAN.dailyRate,
  securityDeposit: formData.securityDeposit || COMPANY_SECURITY_DEPOSIT,
}),

});

const data = await res.json();

if (!data.success) {

alert(data.errors?.join("\n") || "Unable to add vehicle.");

return;

}

 alert("Vehicle Added Successfully");

 setFormData({

vehicleId:"",

registrationNumber:"",

registrationType:"RTO",

chassisNumber:"",

vehicleType:"Electric Scooter",

vehicleModel:"",

batteryType:"Chargeable",

dailyRate: CATALOG_RATES.Daily,

hourlyRate: CATALOG_RATES.Hourly,

weeklyRate: CATALOG_RATES.Weekly,

monthlyRate: CATALOG_RATES.Monthly,

rentToOwnDailyRate: RTO_PLAN.dailyRate,

rentToOwnMonths:18,

securityDeposit: COMPANY_SECURITY_DEPOSIT,

gpsStatus:"OFFLINE",

lockStatus:"Locked",

currentHub:"",

vehicleStatus:"Available",

assignedRider:"",

odometer:0,

lastServiceDate:"",

insuranceExpiry:"",

fitnessExpiry:"",

pollutionExpiry:"",

remarks:"",

});

}
catch (error) {

console.error(error);

alert("Something went wrong while adding the vehicle.");

}
finally {

setSaving(false);

}

};
return(

<PageContainer>

<DashboardHeader

title="Vehicle Management"

subtitle="Register, configure and manage every vehicle across the EVUDDY mobility platform."

/>

<KPIGrid>

<KPICard

title="Vehicles"

value={String(fleetStats.total)}

subtitle={`${fleetStats.available} available`}

icon="🚲"

color="pink"

/>

<KPICard

title="Registration"

value={String(fleetStats.rto)}

subtitle="RTO vehicles in fleet"

icon="📄"

color="blue"

/>

<KPICard

title="GPS online"

value={String(fleetStats.online)}

subtitle="IoT connected"

icon="📡"

color="purple"

/>

<KPICard

title="Locked"

value={String(fleetStats.locked)}

subtitle="Smart lock"

icon="🔒"

color="green"

/>

</KPIGrid>

<SectionHeader

title="Vehicle Registration"

subtitle="Complete all required information before adding a new vehicle."

/>

<DashboardCard

title="Vehicle Registration Form"

subtitle="Every field is directly connected to your MongoDB architecture."

>

<form

onSubmit={handleSubmit}

className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2"
>

<div className="lg:col-span-2">
<SectionHeader
  title="Vehicle identity & hub"
  subtitle="Add the legal identity and starting hub before configuring operations."
/>
</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Vehicle ID
</label>

<input
type="text"
value={formData.vehicleId}
onChange={(e)=>
setFormData({
...formData,
vehicleId:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Registration Number
</label>

<input
type="text"
value={formData.registrationNumber}
onChange={(e)=>
setFormData({
...formData,
registrationNumber:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Registration Type
</label>

<select
value={formData.registrationType}
onChange={(e)=>
setFormData({
...formData,
registrationType:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
"
>

<option>RTO</option>

<option>Non-RTO</option>

</select>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Chassis Number
</label>

<input
type="text"
value={formData.chassisNumber}
onChange={(e)=>
setFormData({
...formData,
chassisNumber:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Vehicle Model
</label>

<input
type="text"
value={formData.vehicleModel}
onChange={(e)=>
setFormData({
...formData,
vehicleModel:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Current Hub
</label>

<select
  value={formData.currentHub}
  onChange={(e) =>
    setFormData({
      ...formData,
      currentHub: e.target.value,
    })
  }
  className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
>
  <option value="">Select hub</option>
  {hubs.map((hub) => (
    <option key={hub.hubCode} value={hub.hubCode}>
      {hub.hubName} ({hub.hubCode}) - {hub.city}
    </option>
  ))}
</select>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Vehicle Type
</label>

<select
value={formData.vehicleType}
onChange={(e)=>
setFormData({
...formData,
vehicleType:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
"
>

<option>Electric Scooter</option>

<option>Electric Bike</option>

<option>Delivery Bike</option>

</select>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Battery Type
</label>

<select
value={formData.batteryType}
onChange={(e)=>
setFormData({
...formData,
batteryType:e.target.value,
 })
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
"
>

<option>Chargeable</option>

<option>Swappable</option>

</select>

</div>

<div className="lg:col-span-2">
<SectionHeader
  title="Plans & fare settings"
  subtitle="Company rental rates stay locked so rider checkout matches the app and website."
/>
</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Daily Rate (₹)
</label>

<input
type="number"
value={CATALOG_RATES.Daily}
disabled
readOnly
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Weekly Rate (₹)
</label>

<input
type="number"
value={CATALOG_RATES.Weekly}
disabled
readOnly
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Monthly Rate (₹)
</label>

<input
type="number"
value={CATALOG_RATES.Monthly}
disabled
readOnly
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Hourly Rate (₹)
</label>

<input
type="number"
value={CATALOG_RATES.Hourly}
disabled
readOnly
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Rent to Own Daily (₹)
</label>

<input
type="number"
value={RTO_PLAN.dailyRate}
disabled
readOnly
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>
<p className="mt-2 text-xs text-slate-500">
  Locked company rate: ₹{RTO_PLAN.dailyRate}/day GST included. Booking always uses this fare.
</p>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Rent to Own Months
</label>

<input
type="number"
value={formData.rentToOwnMonths}
onChange={(e)=>
setFormData({
...formData,
rentToOwnMonths: Math.max(1, Number(e.target.value)),
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Security Deposit
</label>

<input
type="number"
value={formData.securityDeposit}
onChange={(e)=>
setFormData({
...formData,
securityDeposit:Number(e.target.value),
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
"
/>

</div>

<div className="lg:col-span-2">
<SectionHeader
title="Vehicle Status & IoT"
subtitle="Device telemetry supplies battery and GPS readings after the first authenticated check-in."
/>
</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
GPS Status
</label>

<div className="flex min-h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">Waiting for first authenticated device ping</div><p className="mt-2 text-xs text-slate-500">A form entry cannot mark a scooter online.</p>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Lock Status
</label>

<div className="flex min-h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">Locked at registration</div>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Vehicle Status
</label>

<div className="flex min-h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">Available · battery unknown until device check-in</div>

</div>



<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Odometer (KM)
</label>

<input
type="number"
value={formData.odometer}
onChange={(e)=>
setFormData({
...formData,
odometer: Math.max(
0,
Number(e.target.value)
),
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-pink-50/40
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div className="lg:col-span-2">
<SectionHeader
title="Documents & Service Information"
subtitle="Keep legal and maintenance records up to date."
/>
</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Last Service Date
</label>

<input
type="date"
value={formData.lastServiceDate}
onChange={(e)=>
setFormData({
...formData,
lastServiceDate:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Insurance Expiry
</label>

<input
type="date"
value={formData.insuranceExpiry}
onChange={(e)=>
setFormData({
...formData,
insuranceExpiry:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Fitness Expiry
</label>

<input
type="date"
value={formData.fitnessExpiry}
onChange={(e)=>
setFormData({
...formData,
fitnessExpiry:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Pollution Expiry
</label>

<input
type="date"
value={formData.pollutionExpiry}
onChange={(e)=>
setFormData({
...formData,
pollutionExpiry:e.target.value,
})
}
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-white
px-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
"
/>

</div>

<div className="lg:col-span-2">

<label className="block mb-3 font-bold text-[#0A1134]">
Remarks
</label>

<textarea
rows={5}
value={formData.remarks}
onChange={(e)=>
setFormData({
...formData,
remarks:e.target.value,
})
}
className="
w-full
rounded-2xl
border
border-pink-100
bg-pink-50/30
p-5
focus:outline-none
focus:ring-2
focus:ring-pink-200
focus:border-[#FF165E]
transition
resize-none
"
/>

</div>

<div className="lg:col-span-2 pt-6">

<ActionButton
type="submit"
disabled={saving}
>
{saving ? "Adding Vehicle..." : "Add Vehicle"}
</ActionButton>

</div>

</form>

</DashboardCard>

</PageContainer>

);

}
