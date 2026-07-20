"use client";

import { useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import DashboardCard from "../DashboardUI/DashboardCard";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import SectionHeader from "../DashboardUI/SectionHeader";
import ActionButton from "../DashboardUI/ActionButton";

export default function HubManagement() {

const [saving, setSaving] = useState(false);

const [formData,setFormData]=useState({

hubName:"",

hubCode:"",

hubLocation:"",

city:"",

latitude:0,

longitude:0,

geofenceRadius:20,

capacity:0,

availableBikes:0,

readyBatteries:0,

status:"Active",

});

const handleSubmit=async(e:any)=>{

e.preventDefault();

if (!formData.hubName.trim()) {
  alert("Hub Name is required.");
  return;
}

if (!formData.hubCode.trim()) {
  alert("Hub Code is required.");
  return;
}

if (!formData.city.trim()) {
  alert("City is required.");
  return;
}

if (!formData.hubLocation.trim()) {
  alert("Hub Location is required.");
  return;
}

setSaving(true);

const res=await fetch("/api/hubs",{

method:"POST",

headers:{
"Content-Type":"application/json",
},

body:JSON.stringify(formData),

});

const data=await res.json();

if (!data.success) {

setSaving(false);

alert("Unable to add hub.");

return;

}

alert("Hub Added Successfully");

setFormData({

hubName:"",

hubCode:"",

hubLocation:"",

city:"",

latitude:0,

longitude:0,

geofenceRadius:20,

capacity:0,

availableBikes:0,

readyBatteries:0,

status:"Active",

});

setSaving(false);



};

return(

<PageContainer>

<DashboardHeader

title="Hub Management"

subtitle="Register and configure operational hubs across the Kebu One network."

/>

<KPIGrid>

<KPICard
title="Hub Status"
value="Active"
subtitle="Operational"
icon="🏢"
color="green"
/>

<KPICard
title="Geofence"
value="20m"
subtitle="Default Radius"
icon="📍"
color="blue"
/>

<KPICard
title="Parking"
value="Ready"
subtitle="Capacity"
icon="🅿️"
color="yellow"
/>

<KPICard
title="Battery Storage"
value="Enabled"
subtitle="Inventory"
icon="🔋"
color="pink"
/>

</KPIGrid>

<SectionHeader

title="Hub Registration"

subtitle="Fill all required hub information."

/>

<DashboardCard

title="Hub Information"

subtitle="Connected directly with MongoDB"

>

<form

onSubmit={handleSubmit}

className="grid grid-cols-1 lg:grid-cols-2 gap-8"
>
  <div>

<label className="block mb-3 font-bold text-[#0A1134]">
Hub Name
</label>

<input
type="text"
value={formData.hubName}
onChange={(e)=>
setFormData({
...formData,
hubName:e.target.value,
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
Hub Code
</label>

<input
type="text"
value={formData.hubCode}
onChange={(e)=>
setFormData({
...formData,
hubCode:e.target.value,
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
Hub Location
</label>

<input
type="text"
value={formData.hubLocation}
onChange={(e)=>
setFormData({
...formData,
hubLocation:e.target.value,
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
City
</label>

<input
type="text"
value={formData.city}
onChange={(e)=>
setFormData({
...formData,
city:e.target.value,
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
Geofence Radius (Meters)
</label>

<input
type="number"
value={formData.geofenceRadius}
onChange={(e)=>
setFormData({
...formData,
geofenceRadius: Math.max(
10,
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

<div className="lg:col-span-2 mt-8">

<SectionHeader
title="Location Information"
subtitle="Configure GPS coordinates for the hub."
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Latitude
</label>

<input
type="number"
value={formData.latitude}
onChange={(e)=>
setFormData({
...formData,
latitude:Number(e.target.value),
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
Longitude
</label>

<input
type="number"
value={formData.longitude}
onChange={(e)=>
setFormData({
...formData,
longitude:Number(e.target.value),
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

<div className="lg:col-span-2 mt-8">

<SectionHeader
title="Hub Capacity & Inventory"
subtitle="Configure operational capacity and battery inventory."
/>

</div>

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Capacity
</label>

<input
type="number"
value={formData.capacity}
onChange={(e)=>
setFormData({
...formData,
capacity: Math.max(
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

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Available Bikes
</label>

<input
type="number"
value={formData.availableBikes}
onChange={(e)=>
setFormData({
...formData,
availableBikes: Math.max(
0,
Math.min(
formData.capacity,
Number(e.target.value)
)
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
"
/>

</div>





<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Ready Batteries
</label>

<input
type="number"
value={formData.readyBatteries}
onChange={(e)=>
setFormData({
...formData,
readyBatteries: Math.max(
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

<div>

<label className="block mb-3 font-bold text-[#0A1134]">
Hub Status
</label>

<select
value={formData.status}
onChange={(e)=>
setFormData({
...formData,
status:e.target.value,
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

<option>Active</option>

<option>Inactive</option>

<option>Maintenance</option>

</select>

</div>

<div className="lg:col-span-2 pt-6">

<ActionButton
type="submit"
disabled={saving}
>

{saving ? "Adding Hub..." : "Add Hub"}

</ActionButton>

</div>

</form>

</DashboardCard>

</PageContainer>

);

}