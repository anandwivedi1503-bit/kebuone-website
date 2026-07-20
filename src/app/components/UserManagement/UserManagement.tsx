"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

export default function UserManagement(){

const [riders,setRiders]=useState<any[]>([]);
const [search,setSearch]=useState("");
const [statusFilter,setStatusFilter]=useState("All");
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/riders")
    .then((res) => res.json())
    .then((data) => {
      setRiders(data.data || []);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

const totalRiders=riders.length;

const activeUsers=riders.filter(
(rider)=>rider.activeRide===true
).length;

const pendingKYC=riders.filter(
(rider)=>rider.kycStatus==="Pending"
).length;

const suspendedUsers=riders.filter(
(rider)=>rider.approvalStatus==="Suspended"
).length;

const filteredRiders=riders.filter((rider)=>{

const matchesSearch=

rider.fullName?.toLowerCase().includes(search.toLowerCase())||

rider.phone?.includes(search)||

rider.email?.toLowerCase().includes(search.toLowerCase());

const matchesStatus=

statusFilter==="All"||

rider.approvalStatus===statusFilter;
return matchesSearch && matchesStatus;

});

const activateRider = async (id: string) => {

  await fetch(`/api/riders/${id}`, {

    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      approvalStatus: "Approved",
      kycStatus: "Approved",
     activeRide: false,
    }),

  });

  const refreshed = await fetch("/api/riders");
const refreshedData = await refreshed.json();
setRiders(refreshedData.data || []);

};

const suspendRider=async(rider: any) => {

await fetch(`/api/riders/${rider._id}`,{

method:"PATCH",

headers:{
"Content-Type":"application/json",
},

body: JSON.stringify({
  status: "Suspended",
  kycStatus: rider.kycStatus,
  approvalStatus: rider.approvalStatus,
  activeRide: false,
}),

});

const refreshed = await fetch("/api/riders");
const refreshedData = await refreshed.json();
setRiders(refreshedData.data || []);

};

if (loading) {
  return (
    <PageContainer>
      <DashboardHeader
        title="User Management"
        subtitle="Loading riders..."
      />
    </PageContainer>
  );
}

return(

<PageContainer>

<DashboardHeader

title="User Management"

subtitle="Manage riders, KYC verification, wallet balances and account activity."

/>

<KPIGrid>

<KPICard
title="Riders"
value={totalRiders}
subtitle="Registered"
icon="👥"
color="pink"
/>

<KPICard
title="Active"
value={activeUsers}
subtitle="Currently Active"
icon="✅"
color="green"
/>

<KPICard
title="KYC Pending"
value={pendingKYC}
subtitle="Verification"
icon="🪪"
color="yellow"
/>

<KPICard
title="Suspended"
value={suspendedUsers}
subtitle="Restricted"
icon="🚫"
color="red"
/>

</KPIGrid>

<SectionHeader

title="Rider Directory"

subtitle="Search and manage rider accounts."

/>

<div className="flex flex-col md:flex-row gap-4 mb-8">

<input
type="text"
placeholder="Search rider..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="flex-1 h-14 rounded-2xl border border-pink-100 bg-white px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-200"
/>

<select
value={statusFilter}
onChange={(e)=>setStatusFilter(e.target.value)}
className=" h-14 rounded-2xl border border-pink-100 bg-white px-5 focus:outline-none focus:ring-2 focus:ring-pink-200"
>

<option value="All">All</option>
<option value="Approved">Approved</option>
<option value="Rejected">Rejected</option>
<option value="Under Review">Under Review</option>
<option value="Suspended">Suspended</option>

</select>

</div>

<DashboardCard

title="Riders"

subtitle="Live User Records"

>

  <div className="overflow-x-auto rounded-3xl">

<table className="min-w-[1100px] w-full">

<thead>

<tr className="bg-pink-50 border-b border-pink-100">

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Name
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Phone
</th>

<th className="px-6 py-5 text-left font-bold text-[#0A1134]">
Email
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
KYC
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Approval
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Wallet
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Status
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Activate
</th>

<th className="px-6 py-5 text-center font-bold text-[#0A1134]">
Suspend
</th>

</tr>

</thead>

<tbody>

  {filteredRiders.length === 0 && (
  <tr>
    <td
      colSpan={9}
      className="text-center py-12 text-gray-500"
    >
      No riders found.
    </td>
  </tr>
)}

{filteredRiders.map((rider)=>(

<tr
key={rider._id}
className="
border-b
border-pink-50
hover:bg-pink-50/40
transition
"
>

<td className="px-6 py-5 font-semibold">
{rider.fullName}
</td>

<td className="px-6 py-5">
{rider.phone}
</td>

<td className="px-6 py-5 break-all">
{rider.email}
</td>

<td className="px-6 py-5 text-center">

{rider.kycStatus==="Approved"&&(
<StatusBadge status="active"/>
)}

{rider.kycStatus==="Pending"&&(
<StatusBadge status="warning"/>
)}

{rider.kycStatus==="Rejected"&&(
<StatusBadge status="inactive"/>
)}

</td>

<td className="px-6 py-5 text-center">

{rider.approvalStatus==="Approved"&&(
<StatusBadge status="active"/>
)}

{rider.approvalStatus==="Under Review"&&(
<StatusBadge status="warning"/>
)}

{rider.approvalStatus==="Rejected"&&(
<StatusBadge status="inactive"/>
)}

{rider.approvalStatus==="Suspended"&&(
<StatusBadge status="inactive"/>
)}

</td>

<td className="px-6 py-5 text-center font-bold">
₹{rider.walletBalance}
</td>

<td className="px-6 py-5 text-center">

{rider.activeRide?(
<span className="font-bold text-green-600">
ACTIVE
</span>
):(
<span className="font-bold text-red-600">
INACTIVE
</span>
)}

</td>

<td className="px-6 py-5 text-center">

{rider.status === "Suspended" ||
 rider.approvalStatus === "Rejected" ? (
<button
onClick={()=>activateRider(rider._id)}
className="
px-4
py-2
rounded-xl
bg-green-600
text-white
font-semibold
hover:bg-green-700
transition
"
>
Activate
</button>
):(
<span className="text-gray-400">
—
</span>
)}

</td>

<td className="px-6 py-5 text-center">

{rider.status === "Active" ? (
<button
onClick={()=>suspendRider(rider)}
className="
px-4
py-2
rounded-xl
bg-red-600
text-white
font-semibold
hover:bg-red-700
transition
"
>
Suspend
</button>
):(
<span className="text-gray-400">
—
</span>
)}

</td>

</tr>

))}

</tbody>

</table>

</div>

</DashboardCard>
</PageContainer>
);
}
