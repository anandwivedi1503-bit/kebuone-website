"use client";

import { useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import SectionHeader from "../DashboardUI/SectionHeader";
import ActionButton from "../DashboardUI/ActionButton";

export default function VehicleManagement() {

const [formData, setFormData] = useState({

vehicleId: "",

registrationNumber: "",

registrationType: "RTO",

chassisNumber: "",

vehicleType: "Electric Scooter",

vehicleModel: "",

batteryType: "Chargeable",

dailyRate: 200,

weeklyRate: 1200,

monthlyRate: 4500,

securityDeposit: 0,

batteryPercentage: 100,

gpsStatus: "ONLINE",

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

const res = await fetch("/api/vehicles",{

method:"POST",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify(formData),

});

const data = await res.json();

if(data.success){

alert("Vehicle Added Successfully");

setFormData({

vehicleId:"",

registrationNumber:"",

registrationType:"RTO",

chassisNumber:"",

vehicleType:"Electric Scooter",

vehicleModel:"",

batteryType:"Chargeable",

dailyRate:200,

weeklyRate:1200,

monthlyRate:4500,

securityDeposit:0,

batteryPercentage:100,

gpsStatus:"ONLINE",

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

};

return(

<PageContainer>

<DashboardHeader

title="Vehicle Management"

subtitle="Register, configure and manage every vehicle across the Kebu One mobility platform."

/>

<KPIGrid>

<KPICard

title="Vehicle Types"

value="3"

subtitle="Scooter • Bike • Delivery"

icon="🚲"

color="pink"

/>

<KPICard

title="Registration"

value="RTO"

subtitle="Government Verified"

icon="📄"

color="blue"

/>

<KPICard

title="Battery"

value="100%"

subtitle="Default Charge"

icon="🔋"

color="green"

/>

<KPICard

title="GPS"

value="Online"

subtitle="IoT Connected"

icon="📡"

color="purple"

/>

<KPICard

title="Security"

value="Locked"

subtitle="Smart Lock"

icon="🔒"

color="yellow"

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

className="grid grid-cols-1 lg:grid-cols-2 gap-8"
>

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

<input
type="text"
value={formData.currentHub}
onChange={(e)=>
setFormData({
...formData,
currentHub:e.target.value,
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
dailyRate:e.target.value==="Chargeable"?200:250,
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

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Daily Rate (₹)
</label>

<input
type="number"
value={formData.dailyRate}
readOnly
className="
w-full
h-14
rounded-2xl
border
border-pink-100
bg-gray-100
px-5
font-bold
text-[#0A1134]
"
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Weekly Rate (₹)
</label>

<input
type="number"
value={formData.weeklyRate}
onChange={(e)=>
setFormData({
...formData,
weeklyRate:Number(e.target.value),
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

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Monthly Rate (₹)
</label>

<input
type="number"
value={formData.monthlyRate}
onChange={(e)=>
setFormData({
...formData,
monthlyRate:Number(e.target.value),
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

<SectionHeader
title="Vehicle Status & IoT"
subtitle="Configure battery, GPS and operational status."
/>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Battery Percentage
</label>

<input
type="number"
value={formData.batteryPercentage}
onChange={(e)=>
setFormData({
...formData,
batteryPercentage:Number(e.target.value),
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
GPS Status
</label>

<select
value={formData.gpsStatus}
onChange={(e)=>
setFormData({
...formData,
gpsStatus:e.target.value,
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

<option value="ONLINE">Online</option>

<option value="OFFLINE">Offline</option>

</select>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Lock Status
</label>

<select
value={formData.lockStatus}
onChange={(e)=>
setFormData({
...formData,
lockStatus:e.target.value,
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

<option>Locked</option>

<option>Unlocked</option>

</select>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Vehicle Status
</label>

<select
value={formData.vehicleStatus}
onChange={(e)=>
setFormData({
...formData,
vehicleStatus:e.target.value,
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

<option>Available</option>

<option>In Ride</option>

<option>Maintenance</option>

<option>Low Battery</option>

</select>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Assigned Rider
</label>

<input
type="text"
value={formData.assignedRider}
onChange={(e)=>
setFormData({
...formData,
assignedRider:e.target.value,
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
Odometer (KM)
</label>

<input
type="number"
value={formData.odometer}
onChange={(e)=>
setFormData({
...formData,
odometer:Number(e.target.value),
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

<SectionHeader
title="Documents & Service Information"
subtitle="Keep legal and maintenance records up to date."
/>

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

<ActionButton>

Add Vehicle

</ActionButton>

</div>

</form>

</DashboardCard>

</PageContainer>

);

}