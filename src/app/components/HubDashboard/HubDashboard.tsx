"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";
import ActionButton from "../DashboardUI/ActionButton";

export default function HubDashboard() {

const [hubs,setHubs]=useState<any[]>([]);

const [searchTerm,setSearchTerm]=useState("");

const [statusFilter,setStatusFilter]=useState("All");

const [editingHub,setEditingHub]=useState<any>(null);
const [saving, setSaving] = useState(false);

useEffect(()=>{

fetch("/api/hubs")

.then((res)=>res.json())

.then((data)=>{

setHubs(data.data||[]);

});

},[]);

const totalHubs=hubs.length;

const totalCapacity=hubs.reduce(
(sum,hub)=>sum+hub.capacity,
0
);

const totalAvailableBikes=hubs.reduce(
(sum,hub)=>sum+hub.availableBikes,
0
);

const totalReadyBatteries=hubs.reduce(
(sum,hub)=>sum+hub.readyBatteries,
0
);

const filteredHubs=hubs.filter((hub)=>{

const matchesSearch=

hub.hubName
.toLowerCase()
.includes(searchTerm.toLowerCase())

||

hub.hubCode
.toLowerCase()
.includes(searchTerm.toLowerCase());

const matchesStatus=

statusFilter==="All"

?true

:hub.status===statusFilter;

return matchesSearch&&matchesStatus;

});

const deleteHub=async(id:string)=>{

const confirmDelete=confirm(
"Are you sure you want to delete this hub?"
);

if(!confirmDelete) return;

const res=await fetch(`/api/hubs/${id}`,{

method:"DELETE",

});

const data=await res.json();

if(data.success){

setHubs(

hubs.filter(
(hub)=>hub._id!==id
)

);

alert("Hub Deleted Successfully");

}

};

return(

<PageContainer>

<DashboardHeader
title="Hub Dashboard"
subtitle="Manage every operational hub, parking capacity and battery inventory across Kebu One."
/>

<KPIGrid>

<KPICard
title="Total Hubs"
value={totalHubs}
subtitle="Operational"
icon="🏢"
color="pink"
/>

<KPICard
title="Capacity"
value={totalCapacity}
subtitle="Parking Slots"
icon="📍"
color="blue"
/>

<KPICard
title="Available Bikes"
value={totalAvailableBikes}
subtitle="Ready"
icon="🚲"
color="green"
/>

<KPICard
title="Ready Batteries"
value={totalReadyBatteries}
subtitle="Charged"
icon="🔋"
color="yellow"
/>

</KPIGrid>

<SectionHeader
title="Hub Management"
subtitle="Search, monitor and manage every operational hub."
/>

<DashboardCard
title="Hub List"
subtitle="Live MongoDB data"
>
  <div className="flex flex-col lg:flex-row gap-4 mb-8">

<input
type="text"
placeholder="Search Hub Name or Hub Code..."
value={searchTerm}
onChange={(e)=>setSearchTerm(e.target.value)}
className="
flex-1
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

<select
value={statusFilter}
onChange={(e)=>setStatusFilter(e.target.value)}
className="
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

<option value="All">All Status</option>

<option value="Active">Active</option>

<option value="Inactive">Inactive</option>

<option value="Maintenance">Maintenance</option>

</select>

</div>

<div className="overflow-x-auto rounded-3xl">

<table className="min-w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Hub Name
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Capacity
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Available Bikes
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Occupied
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Ready Batteries
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Actions
</th>

</tr>

</thead>

<tbody>

{filteredHubs.map((hub)=>(

<tr
key={hub._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{hub.hubName}
</td>

<td className="px-6 py-5">
{hub.capacity}
</td>

<td className="px-6 py-5 text-center">
{hub.availableBikes}
</td>

<td className="px-6 py-5 text-center">
{hub.capacity-hub.availableBikes}
</td>

<td className="px-6 py-5 text-center">
{hub.readyBatteries}
</td>

<td className="px-6 py-5 text-center">

  {hub.status === "Active" && (
<StatusBadge status="active" />
)}

{hub.status === "Inactive" && (
<StatusBadge status="inactive" />
)}

{hub.status === "Maintenance" && (
<StatusBadge status="warning" />
)}

</td>

<td className="px-6 py-5">

<div className="flex justify-center gap-3">

<ActionButton
onClick={() => setEditingHub(hub)}
>
Edit
</ActionButton>

<button
onClick={() => deleteHub(hub._id)}
className="
px-6
py-3
rounded-2xl
bg-red-500
text-white
font-semibold
hover:bg-red-600
transition
"
>
Delete
</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>

{editingHub && (

<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

<div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl border border-pink-100 overflow-hidden">

<div className="px-8 py-6 bg-gradient-to-r from-[#D6006E] via-[#FF165E] to-[#FF5556]">

<h2 className="text-3xl font-black text-white">
Edit Hub
</h2>

<p className="text-pink-100 mt-2">
Update hub information
</p>

</div>

<div className="p-8 space-y-6">

<div>

<label className="block mb-2 font-semibold text-gray-600">
Hub Name
</label>

<input
type="text"
value={editingHub.hubName}
onChange={(e)=>
setEditingHub({
...editingHub,
hubName:e.target.value,
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
/>

</div>

<div>

<label className="block mb-2 font-semibold text-gray-600">
Capacity
</label>

<input
type="number"
value={editingHub.capacity}
onChange={(e)=>
setEditingHub({
...editingHub,
capacity: Math.max(0, Number(e.target.value)),
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
/>

</div>

<div>

<label className="block mb-2 font-semibold text-gray-600">
Available Bikes
</label>

<input
type="number"
value={editingHub.availableBikes}
onChange={(e)=>
setEditingHub({
...editingHub,
availableBikes: Math.max(
0,
Math.min(
editingHub.capacity,
Number(e.target.value)
)
),
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
/>

</div>

<div>

<label className="block mb-2 font-semibold text-gray-600">
Ready Batteries
</label>

<input
type="number"
value={editingHub.readyBatteries}
onChange={(e)=>
setEditingHub({
...editingHub,
readyBatteries: Math.max(
0,
Number(e.target.value)
),
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
/>

</div>

<div>

<label className="block mb-2 font-semibold text-gray-600">
Status
</label>

<select
value={editingHub.status}
onChange={(e)=>
setEditingHub({
...editingHub,
status:e.target.value,
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
>

<option>Active</option>
<option>Inactive</option>
<option>Maintenance</option>

</select>

</div>

<div className="flex flex-col sm:flex-row gap-4 pt-4">

<ActionButton
disabled={saving}
onClick={async()=>{
setSaving(true);
await fetch(
`/api/hubs/${editingHub._id}`,
{
method:"PATCH",
headers:{
"Content-Type":"application/json",
},
body:JSON.stringify(editingHub),
}
);

const refreshed = await fetch("/api/hubs");
const refreshedData = await refreshed.json();

setHubs(refreshedData.data || []);
setEditingHub(null);
setSaving(false);

}}
>
{saving ? "Saving..." : "Save Changes"}
</ActionButton>

<button
onClick={()=>setEditingHub(null)}
className="
flex-1
h-14
rounded-2xl
border
border-gray-300
font-semibold
hover:bg-gray-100
transition
"
>
Cancel
</button>

</div>

</div>

</div>

</div>

)}

</PageContainer>

);

}